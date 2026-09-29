import { strict as assert } from "assert"

import { afterEach, beforeEach, describe, it } from "mocha"

import {
    RunnerMovementRepository
} from "../src/repository/runner-movement-repository.js"

import type {
    RunnerMovement
} from "../src/repository/runner-movement-repository.js"

import { SchemaService } from "../src/service/schema-service.js"

describe("RunnerMovementRepository", function () {

    let schemaService: SchemaService
    let repository: RunnerMovementRepository

    beforeEach(function () {
        schemaService = new SchemaService(
            ":memory:"
        )

        const database = schemaService.load()

        repository = new RunnerMovementRepository(
            database
        )

        for (const game of [
            {
                gamePk: 123456,
                gameDate: "2026-07-01"
            },
            {
                gamePk: 123457,
                gameDate: "2026-07-02"
            },
            {
                gamePk: 123458,
                gameDate: "2026-07-03"
            }
        ]) {
            database.prepare(`
                INSERT INTO games (
                    game_pk,
                    data,
                    game_type

                )
                VALUES (
                    ?,
                    ?,
                    'R'
                )
            `).run(
                game.gamePk,
                JSON.stringify({
                    gamePk: game.gamePk,
                    gameData: {
                        datetime: {
                            officialDate: game.gameDate
                        }
                    }
                })
            )
        }

        for (const plateAppearance of [
            {
                gamePk: 123456,
                atBatIndex: 0
            },
            {
                gamePk: 123456,
                atBatIndex: 1
            },
            {
                gamePk: 123456,
                atBatIndex: 2
            },
            {
                gamePk: 123457,
                atBatIndex: 0
            },
            {
                gamePk: 123458,
                atBatIndex: 0
            }
        ]) {
            database.prepare(`
                INSERT INTO plate_appearances (
                    game_pk,
                    at_bat_index,
                    inning,
                    half_inning,
                    is_top_inning,
                    batter_id,
                    pitcher_id,
                    rbi,
                    away_score,
                    home_score,
                    balls,
                    strikes,
                    outs,
                    is_complete
                )
                VALUES (
                    @gamePk,
                    @atBatIndex,
                    1,
                    'top',
                    1,
                    100001,
                    200001,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    1
                )
            `).run(plateAppearance)
        }
    })

    afterEach(function () {
        schemaService.close()
    })

    it("returns undefined when the runner movement does not exist", function () {
        assert.equal(
            repository.get(
                123456,
                0,
                0
            ),
            undefined
        )
    })

    it("stores and retrieves a runner movement", function () {
        const runnerMovement = createRunnerMovement(
            123456,
            0,
            0,
            100001
        )

        repository.put(
            runnerMovement
        )

        assert.deepEqual(
            repository.get(
                runnerMovement.gamePk,
                runnerMovement.atBatIndex,
                runnerMovement.runnerIndex
            ),
            runnerMovement
        )
    })

    it("stores nullable runner movement fields", function () {
        const runnerMovement: RunnerMovement = {
            ...createRunnerMovement(
                123456,
                0,
                0,
                100001
            ),
            playIndex: null,
            responsiblePitcherId: null,
            event: null,
            eventType: null,
            movementReason: null,
            originBase: null,
            startBase: null,
            endBase: null,
            outBase: null,
            outNumber: null
        }

        repository.put(
            runnerMovement
        )

        assert.deepEqual(
            repository.get(
                runnerMovement.gamePk,
                runnerMovement.atBatIndex,
                runnerMovement.runnerIndex
            ),
            runnerMovement
        )
    })

    it("returns boolean values after retrieval", function () {
        const runnerMovement: RunnerMovement = {
            ...createRunnerMovement(
                123456,
                0,
                0,
                100001
            ),
            isOut: true,
            isScoringEvent: true,
            earned: false,
            teamUnearned: true
        }

        repository.put(
            runnerMovement
        )

        const storedRunnerMovement = repository.get(
            runnerMovement.gamePk,
            runnerMovement.atBatIndex,
            runnerMovement.runnerIndex
        )

        assert.equal(
            storedRunnerMovement?.isOut,
            true
        )

        assert.equal(
            storedRunnerMovement?.isScoringEvent,
            true
        )

        assert.equal(
            storedRunnerMovement?.earned,
            false
        )

        assert.equal(
            storedRunnerMovement?.teamUnearned,
            true
        )

        assert.equal(
            typeof storedRunnerMovement?.isOut,
            "boolean"
        )

        assert.equal(
            typeof storedRunnerMovement?.isScoringEvent,
            "boolean"
        )

        assert.equal(
            typeof storedRunnerMovement?.earned,
            "boolean"
        )

        assert.equal(
            typeof storedRunnerMovement?.teamUnearned,
            "boolean"
        )
    })

    it("replaces an existing runner movement", function () {
        repository.put(
            createRunnerMovement(
                123456,
                0,
                0,
                100001
            )
        )

        const replacement: RunnerMovement = {
            ...createRunnerMovement(
                123456,
                0,
                0,
                100001
            ),
            playIndex: 4,
            responsiblePitcherId: 200002,
            event: "Stolen Base 2B",
            eventType: "stolen_base_2b",
            movementReason: "r_stolen_base_2b",
            originBase: "1B",
            startBase: "1B",
            endBase: "2B",
            outBase: null,
            isOut: false,
            outNumber: null,
            isScoringEvent: false,
            rbi: 0,
            earned: false,
            teamUnearned: false
        }

        repository.put(
            replacement
        )

        assert.deepEqual(
            repository.get(
                replacement.gamePk,
                replacement.atBatIndex,
                replacement.runnerIndex
            ),
            replacement
        )
    })

    it("keeps movements with different runner indexes", function () {
        const firstMovement = createRunnerMovement(
            123456,
            0,
            0,
            100001
        )

        const secondMovement = createRunnerMovement(
            123456,
            0,
            1,
            100002
        )

        repository.put(firstMovement)
        repository.put(secondMovement)

        assert.deepEqual(
            repository.getByPlateAppearance(
                123456,
                0
            ),
            [
                firstMovement,
                secondMovement
            ]
        )
    })

    it("returns runner movements for a plate appearance ordered by runner index", function () {
        const thirdMovement = createRunnerMovement(
            123456,
            0,
            2,
            100003
        )

        const firstMovement = createRunnerMovement(
            123456,
            0,
            0,
            100001
        )

        const secondMovement = createRunnerMovement(
            123456,
            0,
            1,
            100002
        )

        const unrelatedMovement = createRunnerMovement(
            123456,
            1,
            0,
            100004
        )

        repository.put(thirdMovement)
        repository.put(firstMovement)
        repository.put(secondMovement)
        repository.put(unrelatedMovement)

        assert.deepEqual(
            repository.getByPlateAppearance(
                123456,
                0
            ),
            [
                firstMovement,
                secondMovement,
                thirdMovement
            ]
        )
    })

    it("returns an empty array when a plate appearance has no runner movements", function () {
        assert.deepEqual(
            repository.getByPlateAppearance(
                123456,
                0
            ),
            []
        )
    })

    it("returns runner movements for a game ordered by plate appearance and runner index", function () {
        const fourthMovement = createRunnerMovement(
            123456,
            2,
            1,
            100004
        )

        const thirdMovement = createRunnerMovement(
            123456,
            2,
            0,
            100003
        )

        const secondMovement = createRunnerMovement(
            123456,
            0,
            1,
            100002
        )

        const firstMovement = createRunnerMovement(
            123456,
            0,
            0,
            100001
        )

        const unrelatedMovement = createRunnerMovement(
            123457,
            0,
            0,
            100005
        )

        repository.put(fourthMovement)
        repository.put(thirdMovement)
        repository.put(secondMovement)
        repository.put(firstMovement)
        repository.put(unrelatedMovement)

        assert.deepEqual(
            repository.getByGame(
                123456
            ),
            [
                firstMovement,
                secondMovement,
                thirdMovement,
                fourthMovement
            ]
        )
    })

    it("returns an empty array when a game has no runner movements", function () {
        assert.deepEqual(
            repository.getByGame(
                123456
            ),
            []
        )
    })

    it("returns runner movements for a runner ordered by game and plate appearance", function () {
        const thirdMovement = createRunnerMovement(
            123457,
            0,
            0,
            100001
        )

        const secondMovement = createRunnerMovement(
            123456,
            2,
            0,
            100001
        )

        const firstMovement = createRunnerMovement(
            123456,
            0,
            1,
            100001
        )

        const unrelatedMovement = createRunnerMovement(
            123456,
            1,
            0,
            100002
        )

        repository.put(thirdMovement)
        repository.put(secondMovement)
        repository.put(firstMovement)
        repository.put(unrelatedMovement)

        assert.deepEqual(
            repository.getByRunner(
                100001
            ),
            [
                firstMovement,
                secondMovement,
                thirdMovement
            ]
        )
    })

    it("returns an empty array when a runner has no movements", function () {
        assert.deepEqual(
            repository.getByRunner(
                100001
            ),
            []
        )
    })

    it("returns runner movements within the requested date range", function () {
        const firstMovement = createRunnerMovement(
            123456,
            0,
            0,
            100001
        )

        const secondMovement = createRunnerMovement(
            123457,
            0,
            0,
            100002
        )

        const endDateMovement = createRunnerMovement(
            123458,
            0,
            0,
            100003
        )

        repository.put(firstMovement)
        repository.put(secondMovement)
        repository.put(endDateMovement)

        assert.deepEqual(
            repository.getByDateRange(
                "2026-07-01",
                "2026-07-03"
            ),
            [
                firstMovement,
                secondMovement
            ]
        )
    })

    it("includes the start date and excludes the end date", function () {
        const startDateMovement = createRunnerMovement(
            123456,
            0,
            0,
            100001
        )

        const endDateMovement = createRunnerMovement(
            123457,
            0,
            0,
            100002
        )

        repository.put(startDateMovement)
        repository.put(endDateMovement)

        assert.deepEqual(
            repository.getByDateRange(
                "2026-07-01",
                "2026-07-02"
            ),
            [
                startDateMovement
            ]
        )
    })

    it("returns runner movements ordered by date, game, plate appearance, and runner index", function () {
        const fifthMovement = createRunnerMovement(
            123457,
            0,
            1,
            100005
        )

        const fourthMovement = createRunnerMovement(
            123457,
            0,
            0,
            100004
        )

        const thirdMovement = createRunnerMovement(
            123456,
            2,
            0,
            100003
        )

        const secondMovement = createRunnerMovement(
            123456,
            0,
            1,
            100002
        )

        const firstMovement = createRunnerMovement(
            123456,
            0,
            0,
            100001
        )

        repository.put(fifthMovement)
        repository.put(fourthMovement)
        repository.put(thirdMovement)
        repository.put(secondMovement)
        repository.put(firstMovement)

        assert.deepEqual(
            repository.getByDateRange(
                "2026-07-01",
                "2026-07-03"
            ),
            [
                firstMovement,
                secondMovement,
                thirdMovement,
                fourthMovement,
                fifthMovement
            ]
        )
    })

    it("returns an empty array when no runner movements are within the requested date range", function () {
        repository.put(
            createRunnerMovement(
                123456,
                0,
                0,
                100001
            )
        )

        assert.deepEqual(
            repository.getByDateRange(
                "2026-07-02",
                "2026-07-03"
            ),
            []
        )
    })

    it("deletes all runner movements for a game", function () {
        const firstMovement = createRunnerMovement(
            123456,
            0,
            0,
            100001
        )

        const secondMovement = createRunnerMovement(
            123456,
            1,
            0,
            100002
        )

        const unrelatedMovement = createRunnerMovement(
            123457,
            0,
            0,
            100003
        )

        repository.put(firstMovement)
        repository.put(secondMovement)
        repository.put(unrelatedMovement)

        repository.deleteByGame(
            123456
        )

        assert.deepEqual(
            repository.getByGame(
                123456
            ),
            []
        )

        assert.deepEqual(
            repository.get(
                unrelatedMovement.gamePk,
                unrelatedMovement.atBatIndex,
                unrelatedMovement.runnerIndex
            ),
            unrelatedMovement
        )
    })

    function createRunnerMovement(
        gamePk: number,
        atBatIndex: number,
        runnerIndex: number,
        runnerId: number
    ): RunnerMovement {
        return {
            gamePk,
            atBatIndex,
            runnerIndex,
            playIndex: 2,

            runnerId,
            responsiblePitcherId: 200001,

            event: "Single",
            eventType: "single",
            movementReason: null,

            originBase: null,
            startBase: null,
            endBase: "1B",
            outBase: null,

            isOut: false,
            outNumber: null,
            isScoringEvent: false,
            rbi: 0,
            earned: false,
            teamUnearned: false
        }
    }
})