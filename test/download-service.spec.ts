import { strict as assert } from "assert"

import type { GameFeedResponse, ScheduleResponse } from "mlb-stats-api"

import { afterEach, beforeEach, describe, it } from "mocha"

import { GameRepository } from "../src/repository/game-repository.js"
import { ScheduleRepository } from "../src/repository/schedule-repository.js"
import type { Schedule } from "../src/repository/schedule-repository.js"
import { DownloadService } from "../src/service/download-service.js"
import type { MLBStatsAPIClient } from "../src/service/download-service.js"
import { SchemaService } from "../src/service/schema-service.js"

class MLBStatsAPIClientTestHarness implements MLBStatsAPIClient {

    public readonly scheduleRequests: number[] = []
    public readonly gameRequests: number[] = []
    public readonly schedules = new Map<number, ScheduleResponse>()
    public readonly games = new Map<number, GameFeedResponse>()
    public readonly gameErrors = new Map<number, Error>()

    public async getSchedule(options: { params: { sportId: number, startDate: string, endDate: string, gameTypes: string } }): Promise<{ data: ScheduleResponse }> {
        const season = Number(options.params.startDate.slice(0, 4))
        const schedule = this.schedules.get(season)

        this.scheduleRequests.push(season)

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

        this.gameRequests.push(gamePk)

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
}

describe("DownloadService", () => {

    let schemaService: SchemaService
    let gameRepository: GameRepository
    let scheduleRepository: ScheduleRepository
    let api: MLBStatsAPIClientTestHarness
    let service: DownloadService

    beforeEach(() => {
        schemaService = new SchemaService(":memory:")

        const database = schemaService.load()

        gameRepository = new GameRepository(database)
        scheduleRepository = new ScheduleRepository(database)
        api = new MLBStatsAPIClientTestHarness()
        service = new DownloadService(gameRepository, scheduleRepository, api, 0)
    })

    afterEach(() => {
        schemaService.close()
    })

    it("downloads and stores a missing game", async () => {
        api.games.set(123456, createGameFeed(123456, "Final"))

        const result = await service.syncGame(123456)

        assert.equal(result.downloaded, true)
        assert.deepEqual(result.game, {
            gamePk: 123456,
            data: createGameFeed(123456, "Final")
        })
        assert.deepEqual(gameRepository.get(123456), result.game)
        assert.deepEqual(api.gameRequests, [123456])
    })

    it("returns a cached completed game without downloading it again", async () => {
        gameRepository.put({
            gamePk: 123456,
            data: createGameFeed(123456, "Final")
        })

        const result = await service.syncGame(123456)

        assert.equal(result.downloaded, false)
        assert.deepEqual(result.game, gameRepository.get(123456))
        assert.deepEqual(api.gameRequests, [])
    })

    it("returns a cached postponed game without downloading it again", async () => {
        gameRepository.put({
            gamePk: 123456,
            data: createGameFeed(123456, "Postponed")
        })

        const result = await service.syncGame(123456)

        assert.equal(result.downloaded, false)
        assert.deepEqual(api.gameRequests, [])
    })

    it("refreshes a cached nonterminal game", async () => {
        gameRepository.put({
            gamePk: 123456,
            data: createGameFeed(123456, "In Progress")
        })

        api.games.set(123456, createGameFeed(123456, "Final"))

        const result = await service.syncGame(123456)

        assert.equal(result.downloaded, true)
        assert.deepEqual(result.game.data, createGameFeed(123456, "Final"))
        assert.deepEqual(gameRepository.get(123456), result.game)
        assert.deepEqual(api.gameRequests, [123456])
    })

    it("refreshes a completed game when forced", async () => {
        gameRepository.put({
            gamePk: 123456,
            data: createGameFeed(123456, "Final")
        })

        api.games.set(123456, createGameFeed(123456, "Completed Early"))

        const result = await service.syncGame(123456, true)

        assert.equal(result.downloaded, true)
        assert.deepEqual(result.game.data, createGameFeed(123456, "Completed Early"))
        assert.deepEqual(api.gameRequests, [123456])
    })

    it("downloads and stores a missing schedule", async () => {
        api.schedules.set(2025, createScheduleResponse(2025, [
            {
                gamePk: 123456,
                officialDate: "2025-04-01"
            }
        ]))

        const schedule = await service.getSchedule(2025)

        assert.equal(schedule.season, 2025)
        assert.deepEqual(schedule.data, api.schedules.get(2025))
        assert.match(schedule.downloadedAt, /^\d{4}-\d{2}-\d{2}T/)
        assert.deepEqual(scheduleRepository.get(2025), schedule)
        assert.deepEqual(api.scheduleRequests, [2025])
    })

    it("returns a cached historical schedule without downloading it again", async () => {
        const schedule = createSchedule(2025, "2025-04-01T12:00:00.000Z", [
            {
                gamePk: 123456,
                officialDate: "2025-04-01"
            }
        ])

        scheduleRepository.put(schedule)

        const loaded = await service.getSchedule(2025)

        assert.deepEqual(loaded, schedule)
        assert.deepEqual(api.scheduleRequests, [])
    })

    it("returns a fresh current-season schedule without downloading it again", async () => {
        const season = new Date().getUTCFullYear()
        const schedule = createSchedule(season, new Date().toISOString(), [
            {
                gamePk: 123456,
                officialDate: `${season}-04-01`
            }
        ])

        scheduleRepository.put(schedule)

        const loaded = await service.getSchedule(season)

        assert.deepEqual(loaded, schedule)
        assert.deepEqual(api.scheduleRequests, [])
    })

    it("refreshes a stale current-season schedule", async () => {
        const season = new Date().getUTCFullYear()

        scheduleRepository.put(createSchedule(season, "2000-01-01T00:00:00.000Z", [
            {
                gamePk: 123456,
                officialDate: `${season}-04-01`
            }
        ]))

        api.schedules.set(season, createScheduleResponse(season, [
            {
                gamePk: 123457,
                officialDate: `${season}-04-02`
            }
        ]))

        const loaded = await service.getSchedule(season)

        assert.deepEqual(loaded.data, api.schedules.get(season))
        assert.deepEqual(api.scheduleRequests, [season])
    })

    it("refreshes a historical schedule when forced", async () => {
        scheduleRepository.put(createSchedule(2025, "2025-04-01T12:00:00.000Z", [
            {
                gamePk: 123456,
                officialDate: "2025-04-01"
            }
        ]))

        api.schedules.set(2025, createScheduleResponse(2025, [
            {
                gamePk: 123457,
                officialDate: "2025-04-02"
            }
        ]))

        const loaded = await service.getSchedule(2025, true)

        assert.deepEqual(loaded.data, api.schedules.get(2025))
        assert.deepEqual(api.scheduleRequests, [2025])
    })

    it("synchronizes every eligible game from the season schedule", async () => {
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

        api.games.set(123456, createGameFeed(123456, "Final"))
        api.games.set(123457, createGameFeed(123457, "Final"))

        const synchronized = await service.syncSeason(2025)

        assert.deepEqual(Array.from(synchronized), [123456, 123457])
        assert.deepEqual(api.gameRequests, [123456, 123457])
        assert.ok(gameRepository.get(123456))
        assert.ok(gameRepository.get(123457))
    })

    it("skips future games when synchronizing a season", async () => {
        const season = new Date().getUTCFullYear() + 1

        api.schedules.set(season, createScheduleResponse(season, [
            {
                gamePk: 123456,
                officialDate: `${season}-04-01`
            }
        ]))

        const synchronized = await service.syncSeason(season)

        assert.equal(synchronized.size, 0)
        assert.deepEqual(api.gameRequests, [])
    })

    it("downloads duplicate scheduled game PKs only once", async () => {
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

        api.games.set(123456, createGameFeed(123456, "Final"))

        const synchronized = await service.syncSeason(2025)

        assert.deepEqual(Array.from(synchronized), [123456])
        assert.deepEqual(api.gameRequests, [123456])
    })

    it("continues processing games and reports all download failures", async () => {
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

        api.gameErrors.set(123456, new Error("first failure"))
        api.games.set(123457, createGameFeed(123457, "Final"))
        api.gameErrors.set(123458, new Error("second failure"))

        await assert.rejects(
            service.syncSeason(2025),
            error => {
                assert.ok(error instanceof Error)
                assert.match(error.message, /Download failures: 2/)
                assert.match(error.message, /gamePk=123456: first failure/)
                assert.match(error.message, /gamePk=123458: second failure/)

                return true
            }
        )

        assert.deepEqual(api.gameRequests, [123456, 123457, 123458])
        assert.ok(gameRepository.get(123457))
    })

    function createGameFeed(gamePk: number, detailedState: string): GameFeedResponse {
        return {
            gamePk,
            gameData: {
                status: {
                    detailedState,
                    abstractGameState: detailedState === "Final" ? "Final" : "Live",
                    codedGameState: detailedState === "Final" ? "F" : "I"
                }
            },
            liveData: {}
        } as GameFeedResponse
    }

    function createSchedule(season: number, downloadedAt: string, games: ScheduleGameInput[]): Schedule {
        return {
            season,
            downloadedAt,
            data: createScheduleResponse(season, games)
        }
    }

    function createScheduleResponse(season: number, games: ScheduleGameInput[]): ScheduleResponse {
        return {
            totalItems: games.length,
            totalEvents: 0,
            totalGames: games.length,
            totalGamesInProgress: 0,
            dates: [
                {
                    date: `${season}-04-01`,
                    totalItems: games.length,
                    totalEvents: 0,
                    totalGames: games.length,
                    totalGamesInProgress: 0,
                    games
                }
            ]
        } as unknown as ScheduleResponse
    }
})

interface ScheduleGameInput {
    gamePk: number
    officialDate: string
}