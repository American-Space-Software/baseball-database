import type { GameFeedResponse, ScheduleResponse } from "mlb-stats-api"

import { ScheduleRepository } from "../repository/schedule-repository.js"
import { GameService } from "./game-service.js"
import { Game, Schedule } from "../repository/interfaces.js"

class DownloadService {

    public constructor(
        private readonly gameService: GameService,
        private readonly scheduleRepository: ScheduleRepository,
        private readonly api: MLBStatsAPIClient,
        private readonly throttleMs = 200,
        private readonly scheduleCacheMs = 1000 * 60 * 60) {}

    public async syncSeason(season: number, force = false): Promise<Set<number>> {
        const syncStartedAt = Date.now()

        console.log(`Starting season ${season} synchronization${force ? " with force enabled" : ""}`)

        const scheduleStartedAt = Date.now()
        const games = await this.getSeasonGames(season, force)
        const scheduleDuration = Date.now() - scheduleStartedAt

        console.log(
            `Loaded ${games.length} scheduled games for season ${season} ` +
            `in ${this.formatPreciseDuration(scheduleDuration)}`
        )

        const completedGamePkQueryStartedAt = Date.now()

        const completedGamePks = force
            ? new Set<number>()
            : new Set(
                this.gameService.getCompletedGamePksByDateRange(
                    `${season}-01-01`,
                    `${season}-12-31`
                )
            )

        const completedGamePkQueryDuration = Date.now() - completedGamePkQueryStartedAt

        console.log(
            `Loaded ${completedGamePks.size} completed game PKs ` +
            `for season ${season} in ` +
            `${this.formatPreciseDuration(completedGamePkQueryDuration)}`
        )

        const synchronizedGamePks = new Set<number>()
        const failedGames: DownloadFailure[] = []

        let downloadedGames = 0
        let cachedGames = 0
        let skippedGames = 0
        let cachedCheckDuration = 0
        let downloadDuration = 0
        let throttleDuration = 0

        const loopStartedAt = Date.now()

        for (let index = 0; index < games.length; index++) {
            const scheduledGame = games[index]
            const gamePk = Number(scheduledGame.gamePk)
            const gameDate = this.getGameDate(scheduledGame)

            if (!gamePk || !gameDate || this.isFutureGameDate(gameDate)) {
                skippedGames++
                continue
            }

            const cachedCheckStartedAt = Date.now()
            const isCached = !force && completedGamePks.has(gamePk)

            cachedCheckDuration += Date.now() - cachedCheckStartedAt

            if (isCached) {
                synchronizedGamePks.add(gamePk)
                cachedGames++
                continue
            }

            try {
                const downloadStartedAt = Date.now()

                await this.syncGame(gamePk)

                const gameDownloadDuration = Date.now() - downloadStartedAt

                downloadDuration += gameDownloadDuration
                synchronizedGamePks.add(gamePk)
                downloadedGames++

                console.log(
                    `Downloaded ${index + 1}/${games.length} ` +
                    `(gamePk: ${gamePk}, date: ${gameDate}) ` +
                    `in ${this.formatPreciseDuration(gameDownloadDuration)}`
                )

                if (this.throttleMs > 0) {
                    const throttleStartedAt = Date.now()

                    await this.sleep(this.throttleMs)

                    throttleDuration += Date.now() - throttleStartedAt
                }
            } catch (error: unknown) {
                const message = error instanceof Error
                    ? error.message
                    : String(error)

                failedGames.push({
                    gamePk,
                    gameDate,
                    message
                })

                console.error(
                    `Failed game ${gamePk} (${gameDate}): ${message}`
                )
            }

            if ((index + 1) % 100 === 0 || index === games.length - 1) {
                console.log(
                    `Processed ${index + 1}/${games.length}: ` +
                    `${downloadedGames} downloaded, ` +
                    `${cachedGames} cached, ` +
                    `${skippedGames} skipped, ` +
                    `${failedGames.length} failed, ` +
                    `loop ${this.formatPreciseDuration(Date.now() - loopStartedAt)}`
                )
            }
        }

        const loopDuration = Date.now() - loopStartedAt
        const totalDuration = Date.now() - syncStartedAt

        const unaccountedDuration = Math.max(
            0,
            totalDuration -
            scheduleDuration -
            completedGamePkQueryDuration -
            cachedCheckDuration -
            downloadDuration -
            throttleDuration
        )

        console.log([
            `Season ${season} synchronization timing:`,
            `  Schedule load: ${this.formatPreciseDuration(scheduleDuration)}`,
            `  Completed-PK query: ${this.formatPreciseDuration(completedGamePkQueryDuration)}`,
            `  Cached PK checks: ${this.formatPreciseDuration(cachedCheckDuration)}`,
            `  Game downloads and writes: ${this.formatPreciseDuration(downloadDuration)}`,
            `  Throttling: ${this.formatPreciseDuration(throttleDuration)}`,
            `  Full game loop: ${this.formatPreciseDuration(loopDuration)}`,
            `  Other overhead: ${this.formatPreciseDuration(unaccountedDuration)}`,
            `  Total: ${this.formatPreciseDuration(totalDuration)}`
        ].join("\n"))

        if (failedGames.length > 0) {
            throw new Error([
                `Season ${season} game synchronization failed.`,
                `Download failures: ${failedGames.length}`,
                ...failedGames.map(game =>
                    `${game.gameDate} gamePk=${game.gamePk}: ${game.message}`
                )
            ].join("\n"))
        }

        console.log(
            `Finished processing season ${season}: ` +
            `${downloadedGames} downloaded, ` +
            `${cachedGames} already complete, ` +
            `${skippedGames} skipped, ` +
            `${this.formatPreciseDuration(totalDuration)}`
        )

        return synchronizedGamePks
    }

    public async syncGame(gamePk: number): Promise<Game> {
        const game: Game = {
            gamePk,
            data: await this.downloadGame(gamePk)
        }

        this.gameService.syncGame(game)

        return game
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

                if (gamePk) {
                    games.set(gamePk, game)
                }
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

    private formatPreciseDuration(milliseconds: number): string {
        if (milliseconds < 1000) {
            return `${milliseconds}ms`
        }

        return `${(milliseconds / 1000).toFixed(2)}s`
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

interface DownloadFailure {
    gamePk: number
    gameDate: string
    message: string
}

export {
    DownloadService
}

export type {
    MLBStatsAPIClient
}