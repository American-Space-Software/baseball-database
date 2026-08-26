import { strict as assert } from "assert"

import type { GameFeedResponse, ScheduleResponse } from "mlb-stats-api"

import { afterEach, beforeEach, describe, it } from "mocha"

import { DefensiveEventRepository } from "../src/repository/defensive-event-repository.js"
import { FieldingCreditRepository } from "../src/repository/fielding-credit-repository.js"
import { GameRepository } from "../src/repository/game-repository.js"
import { PitchRepository } from "../src/repository/pitch-repository.js"
import { PlateAppearanceRepository } from "../src/repository/plate-appearance-repository.js"
import { PlayerAppearanceRepository } from "../src/repository/player-appearance-repository.js"
import { PlayerRepository } from "../src/repository/player-repository.js"
import { RosterRepository } from "../src/repository/roster-repository.js"
import { RunnerMovementRepository } from "../src/repository/runner-movement-repository.js"
import { ScheduleRepository } from "../src/repository/schedule-repository.js"

import type { Schedule } from "../src/repository/schedule-repository.js"

import { DownloadService } from "../src/service/download-service.js"
import type { MLBStatsAPIClient } from "../src/service/download-service.js"
import { GameService } from "../src/service/game-service.js"
import { SchemaService } from "../src/service/schema-service.js"


class MLBStatsAPIClientTestHarness implements MLBStatsAPIClient {

    public readonly scheduleRequests: number[] = []
    public readonly gameRequests: number[] = []
    public readonly rosterRequests: {
        teamId: number
        rosterType: string
        date: string
    }[] = []

    public readonly schedules = new Map<number, ScheduleResponse>()
    public readonly games = new Map<number, GameFeedResponse>()
    public readonly rosters = new Map<string, any[]>()
    public readonly gameErrors = new Map<number, Error>()

    public async getSchedule(options: { params: { sportId: number, startDate: string, endDate: string, gameTypes: string } }): Promise<{ data: ScheduleResponse }> {
        const season = Number(options.params.startDate.slice(0, 4))
        const schedule = this.schedules.get(season)

        this.scheduleRequests.push(
            season
        )

        if (!schedule) {
            throw new Error(`Missing test schedule for ${season}.`)
        }

        return {
            data: schedule
        }
    }

    public async getGameFeed(options: { pathParams: { gamePk: number }, params: { hydrate: string } }): Promise<{ data: GameFeedResponse }> {
        const gamePk = options.pathParams.gamePk
        const error = this.gameErrors.get(gamePk)
        const game = this.games.get(gamePk)

        this.gameRequests.push(
            gamePk
        )

        if (error) {
            throw error
        }

        if (!game) {
            throw new Error(`Missing test game ${gamePk}.`)
        }

        return {
            data: game
        }
    }

    public async getTeamRoster(options: { pathParams: { teamId: number }, params: { rosterType: string, date: string } }): Promise<{ data: { roster?: any[] } }> {
        const teamId = options.pathParams.teamId
        const rosterType = options.params.rosterType
        const date = options.params.date
        const key = `${date}:${teamId}`
        const roster = this.rosters.get(key)

        this.rosterRequests.push({
            teamId,
            rosterType,
            date
        })

        if (!roster) {
            throw new Error(`Missing test roster for team ${teamId} on ${date}.`)
        }

        return {
            data: {
                roster
            }
        }
    }

}


describe("DownloadService", function () {

    let schemaService: SchemaService
    let gameRepository: GameRepository
    let scheduleRepository: ScheduleRepository
    let rosterRepository: RosterRepository
    let gameService: GameService
    let api: MLBStatsAPIClientTestHarness
    let service: DownloadService

    beforeEach(function () {
        schemaService = new SchemaService(":memory:")

        const database = schemaService.load()

        gameRepository = new GameRepository(database)
        scheduleRepository = new ScheduleRepository(database)
        rosterRepository = new RosterRepository(database)

        const playerAppearanceRepository = new PlayerAppearanceRepository(database)
        const plateAppearanceRepository = new PlateAppearanceRepository(database)
        const pitchRepository = new PitchRepository(database)
        const runnerMovementRepository = new RunnerMovementRepository(database)
        const fieldingCreditRepository = new FieldingCreditRepository(database)
        const defensiveEventRepository = new DefensiveEventRepository(database)
        const playerRepository = new PlayerRepository(database)

        gameService = new GameService(
            schemaService,
            gameRepository,
            playerAppearanceRepository,
            plateAppearanceRepository,
            pitchRepository,
            runnerMovementRepository,
            fieldingCreditRepository,
            defensiveEventRepository,
            playerRepository
        )

        api = new MLBStatsAPIClientTestHarness()

        service = new DownloadService(
            gameService,
            scheduleRepository,
            rosterRepository,
            api,
            0
        )
    })

    afterEach(function () {
        schemaService.close()
    })

    it("downloads and stores a game", async function () {
        const feed = createGameFeed(
            123456,
            "2025-04-01",
            "Final"
        )

        api.games.set(
            123456,
            feed
        )

        const game = await service.syncGame(
            123456
        )

        assert.deepEqual(
            game,
            {
                gamePk: 123456,
                data: feed
            }
        )

        assert.deepEqual(
            gameRepository.get(123456),
            {
                gamePk: 123456,
                gameDate: "2025-04-01",
                abstractGameState: "Final",
                codedGameState: "F",
                detailedState: "Final",
                statusCode: "F",
                data: feed
            }
        )

        assert.deepEqual(
            api.gameRequests,
            [
                123456
            ]
        )
    })

    it("replaces an existing game when synchronizing it directly", async function () {
        gameRepository.put({
            gamePk: 123456,
            data: createGameFeed(
                123456,
                "2025-04-01",
                "In Progress"
            )
        })

        const finalFeed = createGameFeed(
            123456,
            "2025-04-01",
            "Final"
        )

        api.games.set(
            123456,
            finalFeed
        )

        const game = await service.syncGame(
            123456
        )

        assert.deepEqual(
            game,
            {
                gamePk: 123456,
                data: finalFeed
            }
        )

        assert.deepEqual(
            gameRepository.get(123456),
            {
                gamePk: 123456,
                gameDate: "2025-04-01",
                abstractGameState: "Final",
                codedGameState: "F",
                detailedState: "Final",
                statusCode: "F",
                data: finalFeed
            }
        )

        assert.deepEqual(
            api.gameRequests,
            [
                123456
            ]
        )
    })

    it("downloads and stores a missing schedule", async function () {
        api.schedules.set(2025, createScheduleResponse(2025, [
            {
                gamePk: 123456,
                officialDate: "2025-04-01"
            }
        ]))

        const schedule = await service.getSchedule(
            2025
        )

        assert.equal(
            schedule.season,
            2025
        )

        assert.deepEqual(
            schedule.data,
            api.schedules.get(2025)
        )

        assert.match(
            schedule.downloadedAt,
            /^\d{4}-\d{2}-\d{2}T/
        )

        assert.deepEqual(
            scheduleRepository.get(2025),
            schedule
        )

        assert.deepEqual(
            api.scheduleRequests,
            [
                2025
            ]
        )
    })

    it("returns a cached historical schedule without downloading it again", async function () {
        const schedule = createSchedule(
            2025,
            "2025-04-01T12:00:00.000Z",
            [
                {
                    gamePk: 123456,
                    officialDate: "2025-04-01"
                }
            ]
        )

        scheduleRepository.put(
            schedule
        )

        const loaded = await service.getSchedule(
            2025
        )

        assert.deepEqual(
            loaded,
            schedule
        )

        assert.deepEqual(
            api.scheduleRequests,
            []
        )
    })

    it("returns a fresh current-season schedule without downloading it again", async function () {
        const season = new Date().getUTCFullYear()

        const schedule = createSchedule(
            season,
            new Date().toISOString(),
            [
                {
                    gamePk: 123456,
                    officialDate: `${season}-04-01`
                }
            ]
        )

        scheduleRepository.put(
            schedule
        )

        const loaded = await service.getSchedule(
            season
        )

        assert.deepEqual(
            loaded,
            schedule
        )

        assert.deepEqual(
            api.scheduleRequests,
            []
        )
    })

    it("refreshes a stale current-season schedule", async function () {
        const season = new Date().getUTCFullYear()

        scheduleRepository.put(createSchedule(
            season,
            "2000-01-01T00:00:00.000Z",
            [
                {
                    gamePk: 123456,
                    officialDate: `${season}-04-01`
                }
            ]
        ))

        api.schedules.set(season, createScheduleResponse(season, [
            {
                gamePk: 123457,
                officialDate: `${season}-04-02`
            }
        ]))

        const loaded = await service.getSchedule(
            season
        )

        assert.deepEqual(
            loaded.data,
            api.schedules.get(season)
        )

        assert.deepEqual(
            api.scheduleRequests,
            [
                season
            ]
        )
    })

    it("refreshes a historical schedule when forced", async function () {
        scheduleRepository.put(createSchedule(
            2025,
            "2025-04-01T12:00:00.000Z",
            [
                {
                    gamePk: 123456,
                    officialDate: "2025-04-01"
                }
            ]
        ))

        api.schedules.set(2025, createScheduleResponse(2025, [
            {
                gamePk: 123457,
                officialDate: "2025-04-02"
            }
        ]))

        const loaded = await service.getSchedule(
            2025,
            true
        )

        assert.deepEqual(
            loaded.data,
            api.schedules.get(2025)
        )

        assert.deepEqual(
            api.scheduleRequests,
            [
                2025
            ]
        )
    })

    it("synchronizes every eligible game from the season schedule", async function () {
        api.schedules.set(2025, createScheduleResponse(2025, [
            {
                gamePk: 123456,
                officialDate: "2025-04-01"
            },
            {
                gamePk: 123457,
                officialDate: "2025-04-02"
            }
        ]))

        api.games.set(
            123456,
            createGameFeed(123456, "2025-04-01", "Final")
        )

        api.games.set(
            123457,
            createGameFeed(123457, "2025-04-02", "Final")
        )

        const synchronized = await service.syncSeason(
            2025
        )

        assert.deepEqual(
            Array.from(synchronized),
            [
                123456,
                123457
            ]
        )

        assert.deepEqual(
            api.gameRequests,
            [
                123456,
                123457
            ]
        )

        assert.ok(
            gameRepository.get(123456)
        )

        assert.ok(
            gameRepository.get(123457)
        )
    })

    it("does not download completed games already stored for the date", async function () {
        gameRepository.put({
            gamePk: 123456,
            data: createGameFeed(123456, "2025-04-01", "Final")
        })

        api.schedules.set(2025, createScheduleResponse(2025, [
            {
                gamePk: 123456,
                officialDate: "2025-04-01"
            },
            {
                gamePk: 123457,
                officialDate: "2025-04-01"
            }
        ]))

        api.games.set(
            123457,
            createGameFeed(123457, "2025-04-01", "Final")
        )

        const synchronized = await service.syncSeason(
            2025
        )

        assert.deepEqual(
            Array.from(synchronized),
            [
                123456,
                123457
            ]
        )

        assert.deepEqual(
            api.gameRequests,
            [
                123457
            ]
        )

        assert.ok(
            gameRepository.get(123456)
        )

        assert.ok(
            gameRepository.get(123457)
        )
    })

    it("refreshes stored noncompleted games when synchronizing a season", async function () {
        gameRepository.put({
            gamePk: 123456,
            data: createGameFeed(123456, "2025-04-01", "In Progress")
        })

        api.schedules.set(2025, createScheduleResponse(2025, [
            {
                gamePk: 123456,
                officialDate: "2025-04-01"
            }
        ]))

        const finalFeed = createGameFeed(
            123456,
            "2025-04-01",
            "Final"
        )

        api.games.set(
            123456,
            finalFeed
        )

        const synchronized = await service.syncSeason(
            2025
        )

        assert.deepEqual(
            Array.from(synchronized),
            [
                123456
            ]
        )

        assert.deepEqual(
            api.gameRequests,
            [
                123456
            ]
        )

        assert.deepEqual(
            gameRepository.get(123456)?.data,
            finalFeed
        )
    })

    it("downloads completed games again when synchronization is forced", async function () {
        gameRepository.put({
            gamePk: 123456,
            data: createGameFeed(123456, "2025-04-01", "Final")
        })

        scheduleRepository.put(createSchedule(
            2025,
            "2025-04-01T12:00:00.000Z",
            [
                {
                    gamePk: 123456,
                    officialDate: "2025-04-01"
                }
            ]
        ))

        api.schedules.set(2025, createScheduleResponse(2025, [
            {
                gamePk: 123456,
                officialDate: "2025-04-01"
            }
        ]))

        const completedEarlyFeed = createGameFeed(
            123456,
            "2025-04-01",
            "Completed Early"
        )

        api.games.set(
            123456,
            completedEarlyFeed
        )

        const synchronized = await service.syncSeason(
            2025,
            true
        )

        assert.deepEqual(
            Array.from(synchronized),
            [
                123456
            ]
        )

        assert.deepEqual(
            api.scheduleRequests,
            [
                2025
            ]
        )

        assert.deepEqual(
            api.gameRequests,
            [
                123456
            ]
        )

        assert.deepEqual(
            gameRepository.get(123456)?.data,
            completedEarlyFeed
        )
    })

    it("skips future games when synchronizing a season", async function () {
        const season = new Date().getUTCFullYear() + 1

        api.schedules.set(season, createScheduleResponse(season, [
            {
                gamePk: 123456,
                officialDate: `${season}-04-01`
            }
        ]))

        const synchronized = await service.syncSeason(
            season
        )

        assert.equal(
            synchronized.size,
            0
        )

        assert.deepEqual(
            api.gameRequests,
            []
        )
    })

    it("downloads duplicate scheduled game PKs only once", async function () {
        api.schedules.set(2025, createScheduleResponse(2025, [
            {
                gamePk: 123456,
                officialDate: "2025-04-01"
            },
            {
                gamePk: 123456,
                officialDate: "2025-04-01"
            }
        ]))

        api.games.set(
            123456,
            createGameFeed(123456, "2025-04-01", "Final")
        )

        const synchronized = await service.syncSeason(
            2025
        )

        assert.deepEqual(
            Array.from(synchronized),
            [
                123456
            ]
        )

        assert.deepEqual(
            api.gameRequests,
            [
                123456
            ]
        )
    })

    it("continues processing games and reports all download failures", async function () {
        api.schedules.set(2025, createScheduleResponse(2025, [
            {
                gamePk: 123456,
                officialDate: "2025-04-01"
            },
            {
                gamePk: 123457,
                officialDate: "2025-04-02"
            },
            {
                gamePk: 123458,
                officialDate: "2025-04-03"
            }
        ]))

        api.gameErrors.set(
            123456,
            new Error("first failure")
        )

        api.games.set(
            123457,
            createGameFeed(123457, "2025-04-02", "Final")
        )

        api.gameErrors.set(
            123458,
            new Error("second failure")
        )

        await assert.rejects(
            service.syncSeason(2025),
            error => {
                assert.ok(
                    error instanceof Error
                )

                assert.match(
                    error.message,
                    /Download failures: 2/
                )

                assert.match(
                    error.message,
                    /gamePk=123456: first failure/
                )

                assert.match(
                    error.message,
                    /gamePk=123458: second failure/
                )

                return true
            }
        )

        assert.deepEqual(
            api.gameRequests,
            [
                123456,
                123457,
                123458
            ]
        )

        assert.ok(
            gameRepository.get(123457)
        )
    })


    function createGameFeed(gamePk: number, officialDate: string, detailedState: string): GameFeedResponse {
        const completed =
            detailedState === "Final" ||
            detailedState === "Completed Early"

        return {
            gamePk,
            gameData: {
                datetime: {
                    officialDate
                },
                status: {
                    abstractGameState: completed
                        ? "Final"
                        : "Live",
                    codedGameState: completed
                        ? "F"
                        : "I",
                    detailedState,
                    statusCode: completed
                        ? "F"
                        : "I"
                },
                teams: {
                    away: {
                        id: 10,
                        name: "Away Team"
                    },
                    home: {
                        id: 20,
                        name: "Home Team"
                    }
                }
            },
            liveData: {
                boxscore: {
                    teams: {
                        away: {
                            team: {
                                id: 10
                            },
                            batters: [],
                            pitchers: [],
                            players: {}
                        },
                        home: {
                            team: {
                                id: 20
                            },
                            batters: [],
                            pitchers: [],
                            players: {}
                        }
                    }
                },
                plays: {
                    allPlays: []
                }
            }
        } as unknown as GameFeedResponse
    }

    function createSchedule(season: number, downloadedAt: string, games: ScheduleGameInput[]): Schedule {
        return {
            season,
            downloadedAt,
            data: createScheduleResponse(
                season,
                games
            )
        }
    }

    function createScheduleResponse(season: number, games: ScheduleGameInput[]): ScheduleResponse {
        const dates = new Map<string, ScheduleGameInput[]>()

        for (const game of games) {
            const dateGames = dates.get(
                game.officialDate
            ) ?? []

            dateGames.push(
                game
            )

            dates.set(
                game.officialDate,
                dateGames
            )
        }

        return {
            totalItems: games.length,
            totalEvents: 0,
            totalGames: games.length,
            totalGamesInProgress: 0,
            dates: Array.from(dates.entries()).map(([date, dateGames]) => ({
                date,
                totalItems: dateGames.length,
                totalEvents: 0,
                totalGames: dateGames.length,
                totalGamesInProgress: 0,
                games: dateGames
            }))
        } as unknown as ScheduleResponse
    }

})


interface ScheduleGameInput {
    gamePk: number
    officialDate: string
}