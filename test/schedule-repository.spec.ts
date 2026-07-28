import { strict as assert } from "assert"

import type { ScheduleResponse } from "mlb-stats-api"

import { afterEach, beforeEach, describe, it } from "mocha"

import { ScheduleRepository } from "../src/repository/schedule-repository.js"
import type { Schedule } from "../src/repository/schedule-repository.js"
import { SchemaService } from "../src/service/schema-service.js"

describe("ScheduleRepository", () => {

    let schemaService: SchemaService
    let repository: ScheduleRepository

    beforeEach(() => {
        schemaService = new SchemaService(":memory:")
        repository = new ScheduleRepository(schemaService.load())
    })

    afterEach(() => {
        schemaService.close()
    })

    it("returns undefined when the schedule does not exist", () => {
        const schedule = repository.get(2026)

        assert.equal(schedule, undefined)
    })

    it("stores and retrieves a schedule", () => {
        const schedule = createSchedule(2026, "2026-07-28T12:00:00.000Z", [123456, 123457])

        repository.put(schedule)

        const loaded = repository.get(schedule.season)

        assert.deepEqual(loaded, schedule)
    })

    it("replaces an existing schedule for the same season", () => {
        repository.put(createSchedule(2026, "2026-07-28T12:00:00.000Z", [123456]))
        repository.put(createSchedule(2026, "2026-07-28T13:00:00.000Z", [123456, 123457]))

        assert.deepEqual(
            repository.get(2026),
            createSchedule(2026, "2026-07-28T13:00:00.000Z", [123456, 123457])
        )
    })

    function createSchedule(season: number, downloadedAt: string, gamePks: number[]): Schedule {
        const data = {
            totalItems: gamePks.length,
            totalEvents: 0,
            totalGames: gamePks.length,
            totalGamesInProgress: 0,
            dates: [
                {
                    date: `${season}-04-01`,
                    totalItems: gamePks.length,
                    totalEvents: 0,
                    totalGames: gamePks.length,
                    totalGamesInProgress: 0,
                    games: gamePks.map(gamePk => ({
                        gamePk,
                        officialDate: `${season}-04-01`
                    }))
                }
            ]
        } as unknown as ScheduleResponse

        return {
            season,
            downloadedAt,
            data
        }
    }
})