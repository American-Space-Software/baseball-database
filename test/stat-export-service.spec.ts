import { strict as assert } from "assert"

import { describe, it } from "mocha"

import type { DefensiveEvent } from "../src/repository/defensive-event-repository.js"
import type { FieldingCredit } from "../src/repository/fielding-credit-repository.js"

import { StatExportService } from "../src/service/stat-export-service.js"
import { Pitch, PlateAppearance, PlayerAppearance, RunnerMovement } from "../src/repository/interfaces.js"

interface StatExportGame {
    gamePk: number
    gameDate: string
}

interface StatExportServiceTestData {
    games: StatExportGame[]
    appearances: PlayerAppearance[]
    plateAppearances: PlateAppearance[]
    pitches: Pitch[]
    runnerMovements: RunnerMovement[]
    fieldingCredits: FieldingCredit[]
    defensiveEvents: DefensiveEvent[]
}

class DateRangeRepositoryTestDouble<T> {

    public readonly calls: { startDate: string, endDate: string }[] = []

    public constructor(private readonly results: T[]) {}

    public getByDateRange(startDate: string, endDate: string): T[] {
        this.calls.push({ startDate, endDate })

        return this.results
    }
}

class GameDateRepositoryTestDouble {

    public readonly calls: { startDate: string, endDate: string }[] = []

    public constructor(private readonly results: StatExportGame[]) {}

    public getGameDatesByDateRange(startDate: string, endDate: string): StatExportGame[] {
        this.calls.push({ startDate, endDate })

        return this.results
    }
}

class StatExportServiceTestHarness {

    public readonly gameRepository: GameDateRepositoryTestDouble
    public readonly playerAppearanceRepository: DateRangeRepositoryTestDouble<PlayerAppearance>
    public readonly plateAppearanceRepository: DateRangeRepositoryTestDouble<PlateAppearance>
    public readonly pitchRepository: DateRangeRepositoryTestDouble<Pitch>
    public readonly runnerMovementRepository: DateRangeRepositoryTestDouble<RunnerMovement>
    public readonly fieldingCreditRepository: DateRangeRepositoryTestDouble<FieldingCredit>
    public readonly defensiveEventRepository: DateRangeRepositoryTestDouble<DefensiveEvent>
    public readonly service: StatExportService

    public constructor(data: StatExportServiceTestData) {
        this.gameRepository = new GameDateRepositoryTestDouble(data.games)
        this.playerAppearanceRepository = new DateRangeRepositoryTestDouble(data.appearances)
        this.plateAppearanceRepository = new DateRangeRepositoryTestDouble(data.plateAppearances)
        this.pitchRepository = new DateRangeRepositoryTestDouble(data.pitches)
        this.runnerMovementRepository = new DateRangeRepositoryTestDouble(data.runnerMovements)
        this.fieldingCreditRepository = new DateRangeRepositoryTestDouble(data.fieldingCredits)
        this.defensiveEventRepository = new DateRangeRepositoryTestDouble(data.defensiveEvents)

        this.service = new StatExportService(
            this.gameRepository as any,
            this.playerAppearanceRepository as any,
            this.plateAppearanceRepository as any,
            this.pitchRepository as any,
            this.runnerMovementRepository as any,
            this.fieldingCreditRepository as any,
            this.defensiveEventRepository as any
        )
    }
}

describe("StatExportService", () => {

    it("returns every normalized record in the requested date range", () => {
        const games = [
            {
                gamePk: 100,
                gameDate: "2026-07-15"
            }
        ]

        const appearances = [
            {
                gamePk: 100,
                teamId: 10,
                playerId: 123
            },
            {
                gamePk: 100,
                teamId: 20,
                playerId: 456
            }
        ] as PlayerAppearance[]

        const plateAppearances = [
            {
                gamePk: 100,
                atBatIndex: 1,
                batterId: 123,
                pitcherId: 456
            },
            {
                gamePk: 100,
                atBatIndex: 2,
                batterId: 456,
                pitcherId: 789
            }
        ] as PlateAppearance[]

        const pitches = [
            {
                gamePk: 100,
                atBatIndex: 1,
                eventIndex: 0,
                plateAppearanceId: "100:1",
                batterId: 123,
                pitcherId: 456
            },
            {
                gamePk: 100,
                atBatIndex: 2,
                eventIndex: 0,
                plateAppearanceId: "100:2",
                batterId: 456,
                pitcherId: 789
            }
        ] as Pitch[]

        const runnerMovements = [
            {
                gamePk: 100,
                atBatIndex: 1,
                runnerIndex: 0,
                runnerId: 123,
                responsiblePitcherId: 456
            },
            {
                gamePk: 100,
                atBatIndex: 2,
                runnerIndex: 0,
                runnerId: 456,
                responsiblePitcherId: 789
            }
        ] as RunnerMovement[]

        const fieldingCredits = [
            {
                gamePk: 100,
                atBatIndex: 1,
                runnerIndex: 0,
                creditIndex: 0,
                playerId: 123
            },
            {
                gamePk: 100,
                atBatIndex: 2,
                runnerIndex: 0,
                creditIndex: 0,
                playerId: 456
            }
        ] as FieldingCredit[]

        const defensiveEvents = [
            {
                gamePk: 100,
                atBatIndex: 1,
                eventIndex: 0,
                playerId: 123
            },
            {
                gamePk: 100,
                atBatIndex: 2,
                eventIndex: 0,
                playerId: 456
            }
        ] as DefensiveEvent[]

        const harness = new StatExportServiceTestHarness({
            games,
            appearances,
            plateAppearances,
            pitches,
            runnerMovements,
            fieldingCredits,
            defensiveEvents
        })

        const result = harness.service.getByDateRange(
            "2026-07-01",
            "2026-08-01"
        )

        assert.deepEqual(result, {
            games,
            appearances,
            plateAppearances,
            pitches,
            runnerMovements,
            fieldingCredits,
            defensiveEvents
        })
    })

    it("does not filter records by player", () => {
        const games = [
            {
                gamePk: 100,
                gameDate: "2026-07-15"
            }
        ]

        const appearances = [
            {
                gamePk: 100,
                teamId: 10,
                playerId: 123
            },
            {
                gamePk: 100,
                teamId: 20,
                playerId: 456
            }
        ] as PlayerAppearance[]

        const plateAppearances = [
            {
                gamePk: 100,
                atBatIndex: 1,
                batterId: 123,
                pitcherId: 456
            },
            {
                gamePk: 100,
                atBatIndex: 2,
                batterId: 456,
                pitcherId: 789
            }
        ] as PlateAppearance[]

        const pitches = [
            {
                gamePk: 100,
                atBatIndex: 1,
                eventIndex: 0,
                plateAppearanceId: "100:1",
                batterId: 123,
                pitcherId: 456
            },
            {
                gamePk: 100,
                atBatIndex: 2,
                eventIndex: 0,
                plateAppearanceId: "100:2",
                batterId: 456,
                pitcherId: 789
            }
        ] as Pitch[]

        const harness = new StatExportServiceTestHarness({
            games,
            appearances,
            plateAppearances,
            pitches,
            runnerMovements: [],
            fieldingCredits: [],
            defensiveEvents: []
        })

        const result = harness.service.getByDateRange(
            "2026-07-01",
            "2026-08-01"
        )

        assert.deepEqual(result.games, games)
        assert.deepEqual(result.appearances, appearances)
        assert.deepEqual(result.plateAppearances, plateAppearances)
        assert.deepEqual(result.pitches, pitches)
    })

    it("loads each repository once using the requested date range", () => {
        const harness = new StatExportServiceTestHarness({
            games: [],
            appearances: [],
            plateAppearances: [],
            pitches: [],
            runnerMovements: [],
            fieldingCredits: [],
            defensiveEvents: []
        })

        harness.service.getByDateRange(
            "2026-07-01",
            "2026-08-01"
        )

        const expectedCalls = [
            {
                startDate: "2026-07-01",
                endDate: "2026-08-01"
            }
        ]

        assert.deepEqual(harness.gameRepository.calls, expectedCalls)
        assert.deepEqual(harness.playerAppearanceRepository.calls, expectedCalls)
        assert.deepEqual(harness.plateAppearanceRepository.calls, expectedCalls)
        assert.deepEqual(harness.pitchRepository.calls, expectedCalls)
        assert.deepEqual(harness.runnerMovementRepository.calls, expectedCalls)
        assert.deepEqual(harness.fieldingCreditRepository.calls, expectedCalls)
        assert.deepEqual(harness.defensiveEventRepository.calls, expectedCalls)
    })

    it("returns empty collections when the date range has no records", () => {
        const harness = new StatExportServiceTestHarness({
            games: [],
            appearances: [],
            plateAppearances: [],
            pitches: [],
            runnerMovements: [],
            fieldingCredits: [],
            defensiveEvents: []
        })

        const result = harness.service.getByDateRange(
            "2026-07-01",
            "2026-08-01"
        )

        assert.deepEqual(result, {
            games: [],
            appearances: [],
            plateAppearances: [],
            pitches: [],
            runnerMovements: [],
            fieldingCredits: [],
            defensiveEvents: []
        })
    })
})