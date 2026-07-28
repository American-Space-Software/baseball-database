
import type { GameFeedResponse, ScheduleResponse } from "mlb-stats-api"

import { GameRepository } from "../repository/game-repository.js"
import type { Game } from "../repository/game-repository.js"
import { ScheduleRepository } from "../repository/schedule-repository.js"
import type { Schedule } from "../repository/schedule-repository.js"

class DownloadService {

    public constructor(
        private readonly gameRepository: GameRepository, 
        private readonly scheduleRepository: ScheduleRepository, 
        private readonly api: MLBStatsAPIClient, 
        private readonly throttleMs = 200, 
        private readonly scheduleCacheMs = 1000 * 60 * 60) {}

    public async syncSeason(season: number, force = false): Promise<Set<number>> {
        const games = await this.getSeasonGames(season, force)
        const synchronizedGamePks = new Set<number>()
        const failedGames: DownloadFailure[] = []

        console.log(`Processing ${games.length} games for season ${season}`)

        for (let index = 0; index < games.length; index++) {
            const scheduledGame = games[index]
            const gamePk = Number(scheduledGame.gamePk)
            const gameDate = this.getGameDate(scheduledGame)

            if (!gamePk || !gameDate || this.isFutureGameDate(gameDate)) {
                continue
            }

            try {
                const result = await this.syncGame(gamePk, force)

                synchronizedGamePks.add(gamePk)

                console.log(
                    `Processed ${index + 1}/${games.length} ` +
                    `(gamePk: ${gamePk}, date: ${gameDate}, downloaded: ${result.downloaded})`
                )

                if (result.downloaded && this.throttleMs > 0) {
                    await this.sleep(this.throttleMs)
                }
            } catch (error: unknown) {
                const message = error instanceof Error ? error.message : String(error)

                failedGames.push({
                    gamePk,
                    gameDate,
                    message
                })

                console.error(`Failed game ${gamePk} (${gameDate}): ${message}`)
            }
        }

        if (failedGames.length > 0) {
            throw new Error([
                `Season ${season} game synchronization failed.`,
                `Download failures: ${failedGames.length}`,
                ...failedGames.map(game => `${game.gameDate} gamePk=${game.gamePk}: ${game.message}`)
            ].join("\n"))
        }

        console.log(`Finished processing season ${season}: ${synchronizedGamePks.size} games synchronized`)

        return synchronizedGamePks
    }

    public async syncGame(gamePk: number, force = false): Promise<DownloadResult> {
        const existing = this.gameRepository.get(gamePk)

        if (!force && existing && this.isGameTerminal(existing.data)) {
            return {
                game: existing,
                downloaded: false
            }
        }

        const game = {
            gamePk,
            data: await this.downloadGame(gamePk)
        }

        this.gameRepository.put(game)

        return {
            game,
            downloaded: true
        }
    }

    public async getSchedule(season: number, force = false): Promise<Schedule> {
        const existing = this.scheduleRepository.get(season)

        if (!force && existing && !this.shouldRefreshSchedule(existing)) {
            return existing
        }

        const schedule = {
            season,
            data: await this.downloadSchedule(season),
            downloadedAt: new Date().toISOString()
        }

        this.scheduleRepository.put(schedule)

        return schedule
    }

    private async getSeasonGames(season: number, force: boolean): Promise<ScheduleGame[]> {
        const schedule = await this.getSchedule(season, force)
        const games = new Map<number, ScheduleGame>()

        for (const date of schedule.data.dates ?? []) {
            for (const scheduleGame of date.games ?? []) {
                const game = scheduleGame as ScheduleGame
                const gamePk = Number(game.gamePk)

                if (!gamePk) {
                    continue
                }

                games.set(gamePk, game)
            }
        }

        return Array.from(games.values()).sort((a, b) => {
            const aDate = this.getGameDate(a) ?? ""
            const bDate = this.getGameDate(b) ?? ""

            if (aDate !== bDate) {
                return aDate.localeCompare(bDate)
            }

            return Number(a.gamePk) - Number(b.gamePk)
        })
    }

    private async downloadSchedule(season: number): Promise<ScheduleResponse> {
        const response = await this.api.getSchedule({
            params: {
                sportId: 1,
                startDate: `${season}-01-01`,
                endDate: `${season}-12-31`,
                gameTypes: "R"
            }
        })

        return response.data
    }

    private async downloadGame(gamePk: number): Promise<GameFeedResponse> {
        const response = await this.api.getGameFeed({
            pathParams: {
                gamePk
            },
            params: {
                hydrate: "credits,alignment,flags,officials"
            }
        })

        return response.data
    }

    private shouldRefreshSchedule(schedule: Schedule): boolean {
        if (!this.isCurrentSeason(schedule.season)) {
            return false
        }

        const downloadedAt = new Date(schedule.downloadedAt).getTime()

        if (!Number.isFinite(downloadedAt)) {
            return true
        }

        return Date.now() - downloadedAt > this.scheduleCacheMs
    }

    private getGameDate(game: ScheduleGame): string | undefined {
        return game.officialDate ?? game.gameDate?.slice(0, 10)
    }

    private isCurrentSeason(season: number): boolean {
        return season === new Date().getUTCFullYear()
    }

    private isFutureGameDate(gameDate: string): boolean {
        const gameTime = new Date(`${gameDate}T00:00:00.000Z`).getTime()

        if (!Number.isFinite(gameTime)) {
            return false
        }

        const now = new Date()
        const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())

        return gameTime > today
    }

    private isGameComplete(data: GameFeedResponse): boolean {
        const abstractState = String(data.gameData?.status?.abstractGameState ?? "")
        const codedState = String(data.gameData?.status?.codedGameState ?? "")
        const detailedState = String(data.gameData?.status?.detailedState ?? "")

        return abstractState === "Final" ||
            codedState === "F" ||
            detailedState === "Final" ||
            detailedState === "Completed Early"
    }

    private isGameTerminal(data: GameFeedResponse): boolean {
        if (this.isGameComplete(data)) {
            return true
        }

        const detailedState = String(data.gameData?.status?.detailedState ?? "").toLowerCase()

        return detailedState.includes("cancelled") ||
            detailedState.includes("canceled") ||
            detailedState.includes("postponed")
    }

    private async sleep(milliseconds: number): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, milliseconds))
    }
}

interface ScheduleGame {
    gamePk: number
    officialDate?: string
    gameDate?: string
}

interface MLBStatsAPIClient {

    getSchedule(options: {
        params: {
            sportId: number
            startDate: string
            endDate: string
            gameTypes: string
        }
    }): Promise<{
        data: ScheduleResponse
    }>

    getGameFeed(options: {
        pathParams: {
            gamePk: number
        }
        params: {
            hydrate: string
        }
    }): Promise<{
        data: GameFeedResponse
    }>
}

interface DownloadResult {
    game: Game
    downloaded: boolean
}

interface DownloadFailure {
    gamePk: number
    gameDate: string
    message: string
}

export {
    DownloadService
}

export type {
    DownloadResult,
    MLBStatsAPIClient
}