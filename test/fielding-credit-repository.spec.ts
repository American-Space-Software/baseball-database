import { strict as assert } from "assert"

import { afterEach, beforeEach, describe, it } from "mocha"

import {
    FieldingCreditRepository
} from "../src/repository/fielding-credit-repository.js"

import type {
    FieldingCredit
} from "../src/repository/fielding-credit-repository.js"

import { SchemaService } from "../src/service/schema-service.js"

describe("FieldingCreditRepository", function () {

    let schemaService: SchemaService
    let repository: FieldingCreditRepository

    beforeEach(function () {
        schemaService = new SchemaService(
            ":memory:"
        )

        const database = schemaService.load()

        repository = new FieldingCreditRepository(
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
                            game: {
                                type: "R"
                            },
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

        for (const runnerMovement of [
            {
                gamePk: 123456,
                atBatIndex: 0,
                runnerIndex: 0,
                runnerId: 100001
            },
            {
                gamePk: 123456,
                atBatIndex: 0,
                runnerIndex: 1,
                runnerId: 100002
            },
            {
                gamePk: 123456,
                atBatIndex: 1,
                runnerIndex: 0,
                runnerId: 100003
            },
            {
                gamePk: 123456,
                atBatIndex: 2,
                runnerIndex: 0,
                runnerId: 100004
            },
            {
                gamePk: 123457,
                atBatIndex: 0,
                runnerIndex: 0,
                runnerId: 100005
            },
            {
                gamePk: 123458,
                atBatIndex: 0,
                runnerIndex: 0,
                runnerId: 100006
            }
        ]) {
            database.prepare(`
                INSERT INTO runner_movements (
                    game_pk,
                    at_bat_index,
                    runner_index,
                    runner_id,
                    is_out,
                    is_scoring_event,
                    rbi,
                    earned,
                    team_unearned
                )
                VALUES (
                    @gamePk,
                    @atBatIndex,
                    @runnerIndex,
                    @runnerId,
                    0,
                    0,
                    0,
                    0,
                    0
                )
            `).run(runnerMovement)
        }
    })

    afterEach(function () {
        schemaService.close()
    })

    it("returns undefined when the fielding credit does not exist", function () {
        assert.equal(
            repository.get(
                123456,
                0,
                0,
                0
            ),
            undefined
        )
    })

    it("stores and retrieves a fielding credit", function () {
        const fieldingCredit = createFieldingCredit(
            123456,
            0,
            0,
            0,
            300001
        )

        repository.put(
            fieldingCredit
        )

        assert.deepEqual(
            repository.get(
                fieldingCredit.gamePk,
                fieldingCredit.atBatIndex,
                fieldingCredit.runnerIndex,
                fieldingCredit.creditIndex
            ),
            fieldingCredit
        )
    })

    it("stores nullable position fields", function () {
        const fieldingCredit: FieldingCredit = {
            ...createFieldingCredit(
                123456,
                0,
                0,
                0,
                300001
            ),
            positionCode: null,
            positionName: null,
            positionType: null,
            positionAbbreviation: null
        }

        repository.put(
            fieldingCredit
        )

        assert.deepEqual(
            repository.get(
                fieldingCredit.gamePk,
                fieldingCredit.atBatIndex,
                fieldingCredit.runnerIndex,
                fieldingCredit.creditIndex
            ),
            fieldingCredit
        )
    })

    it("replaces an existing fielding credit", function () {
        repository.put(
            createFieldingCredit(
                123456,
                0,
                0,
                0,
                300001
            )
        )

        const replacement: FieldingCredit = {
            ...createFieldingCredit(
                123456,
                0,
                0,
                0,
                300002
            ),
            credit: "assist",
            positionCode: "6",
            positionName: "Shortstop",
            positionType: "Infielder",
            positionAbbreviation: "SS"
        }

        repository.put(
            replacement
        )

        assert.deepEqual(
            repository.get(
                replacement.gamePk,
                replacement.atBatIndex,
                replacement.runnerIndex,
                replacement.creditIndex
            ),
            replacement
        )
    })

    it("keeps credits with different credit indexes", function () {
        const firstCredit = createFieldingCredit(
            123456,
            0,
            0,
            0,
            300001
        )

        const secondCredit: FieldingCredit = {
            ...createFieldingCredit(
                123456,
                0,
                0,
                1,
                300002
            ),
            credit: "assist",
            positionCode: "6",
            positionName: "Shortstop",
            positionType: "Infielder",
            positionAbbreviation: "SS"
        }

        repository.put(firstCredit)
        repository.put(secondCredit)

        assert.deepEqual(
            repository.getByRunnerMovement(
                123456,
                0,
                0
            ),
            [
                firstCredit,
                secondCredit
            ]
        )
    })

    it("returns credits for a runner movement ordered by credit index", function () {
        const thirdCredit = createFieldingCredit(
            123456,
            0,
            0,
            2,
            300003
        )

        const firstCredit = createFieldingCredit(
            123456,
            0,
            0,
            0,
            300001
        )

        const secondCredit = createFieldingCredit(
            123456,
            0,
            0,
            1,
            300002
        )

        const unrelatedCredit = createFieldingCredit(
            123456,
            0,
            1,
            0,
            300004
        )

        repository.put(thirdCredit)
        repository.put(firstCredit)
        repository.put(secondCredit)
        repository.put(unrelatedCredit)

        assert.deepEqual(
            repository.getByRunnerMovement(
                123456,
                0,
                0
            ),
            [
                firstCredit,
                secondCredit,
                thirdCredit
            ]
        )
    })

    it("returns an empty array when a runner movement has no credits", function () {
        assert.deepEqual(
            repository.getByRunnerMovement(
                123456,
                0,
                0
            ),
            []
        )
    })

    it("returns credits for a plate appearance ordered by runner and credit index", function () {
        const fourthCredit = createFieldingCredit(
            123456,
            0,
            1,
            1,
            300004
        )

        const thirdCredit = createFieldingCredit(
            123456,
            0,
            1,
            0,
            300003
        )

        const secondCredit = createFieldingCredit(
            123456,
            0,
            0,
            1,
            300002
        )

        const firstCredit = createFieldingCredit(
            123456,
            0,
            0,
            0,
            300001
        )

        const unrelatedCredit = createFieldingCredit(
            123456,
            1,
            0,
            0,
            300005
        )

        repository.put(fourthCredit)
        repository.put(thirdCredit)
        repository.put(secondCredit)
        repository.put(firstCredit)
        repository.put(unrelatedCredit)

        assert.deepEqual(
            repository.getByPlateAppearance(
                123456,
                0
            ),
            [
                firstCredit,
                secondCredit,
                thirdCredit,
                fourthCredit
            ]
        )
    })

    it("returns an empty array when a plate appearance has no credits", function () {
        assert.deepEqual(
            repository.getByPlateAppearance(
                123456,
                0
            ),
            []
        )
    })

    it("returns credits for a game ordered by plate appearance, runner, and credit index", function () {
        const fourthCredit = createFieldingCredit(
            123456,
            2,
            0,
            1,
            300004
        )

        const thirdCredit = createFieldingCredit(
            123456,
            2,
            0,
            0,
            300003
        )

        const secondCredit = createFieldingCredit(
            123456,
            0,
            0,
            1,
            300002
        )

        const firstCredit = createFieldingCredit(
            123456,
            0,
            0,
            0,
            300001
        )

        const unrelatedCredit = createFieldingCredit(
            123457,
            0,
            0,
            0,
            300005
        )

        repository.put(fourthCredit)
        repository.put(thirdCredit)
        repository.put(secondCredit)
        repository.put(firstCredit)
        repository.put(unrelatedCredit)

        assert.deepEqual(
            repository.getByGame(
                123456
            ),
            [
                firstCredit,
                secondCredit,
                thirdCredit,
                fourthCredit
            ]
        )
    })

    it("returns an empty array when a game has no credits", function () {
        assert.deepEqual(
            repository.getByGame(
                123456
            ),
            []
        )
    })

    it("returns credits for a player ordered by game and play location", function () {
        const thirdCredit = createFieldingCredit(
            123457,
            0,
            0,
            0,
            300001
        )

        const secondCredit = createFieldingCredit(
            123456,
            2,
            0,
            0,
            300001
        )

        const firstCredit = createFieldingCredit(
            123456,
            0,
            0,
            1,
            300001
        )

        const unrelatedCredit = createFieldingCredit(
            123456,
            1,
            0,
            0,
            300002
        )

        repository.put(thirdCredit)
        repository.put(secondCredit)
        repository.put(firstCredit)
        repository.put(unrelatedCredit)

        assert.deepEqual(
            repository.getByPlayer(
                300001
            ),
            [
                firstCredit,
                secondCredit,
                thirdCredit
            ]
        )
    })

    it("returns an empty array when a player has no credits", function () {
        assert.deepEqual(
            repository.getByPlayer(
                300001
            ),
            []
        )
    })

    it("returns fielding credits within the requested date range", function () {
        const firstCredit = createFieldingCredit(
            123456,
            0,
            0,
            0,
            300001
        )

        const secondCredit = createFieldingCredit(
            123457,
            0,
            0,
            0,
            300002
        )

        const thirdCredit = createFieldingCredit(
            123458,
            0,
            0,
            0,
            300003
        )

        repository.put(firstCredit)
        repository.put(secondCredit)
        repository.put(thirdCredit)

        assert.deepEqual(
            repository.getByDateRange(
                "2026-07-01",
                "2026-07-03"
            ),
            [
                firstCredit,
                secondCredit
            ]
        )
    })

    it("includes the start date and excludes the end date", function () {
        const startDateCredit = createFieldingCredit(
            123456,
            0,
            0,
            0,
            300001
        )

        const endDateCredit = createFieldingCredit(
            123457,
            0,
            0,
            0,
            300002
        )

        repository.put(startDateCredit)
        repository.put(endDateCredit)

        assert.deepEqual(
            repository.getByDateRange(
                "2026-07-01",
                "2026-07-02"
            ),
            [
                startDateCredit
            ]
        )
    })

    it("returns fielding credits ordered by date, game, plate appearance, runner, and credit index", function () {
        const firstCredit = createFieldingCredit(
            123456,
            0,
            0,
            0,
            300001
        )

        const secondCredit = createFieldingCredit(
            123456,
            0,
            0,
            1,
            300002
        )

        const thirdCredit = createFieldingCredit(
            123456,
            0,
            1,
            0,
            300003
        )

        const fourthCredit = createFieldingCredit(
            123456,
            2,
            0,
            0,
            300004
        )

        const fifthCredit = createFieldingCredit(
            123457,
            0,
            0,
            0,
            300005
        )

        repository.put(fifthCredit)
        repository.put(fourthCredit)
        repository.put(thirdCredit)
        repository.put(secondCredit)
        repository.put(firstCredit)

        assert.deepEqual(
            repository.getByDateRange(
                "2026-07-01",
                "2026-07-03"
            ),
            [
                firstCredit,
                secondCredit,
                thirdCredit,
                fourthCredit,
                fifthCredit
            ]
        )
    })

    it("returns an empty array when no fielding credits are within the requested date range", function () {
        repository.put(
            createFieldingCredit(
                123456,
                0,
                0,
                0,
                300001
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

    it("deletes all fielding credits for a game", function () {
        const firstCredit = createFieldingCredit(
            123456,
            0,
            0,
            0,
            300001
        )

        const secondCredit = createFieldingCredit(
            123456,
            1,
            0,
            0,
            300002
        )

        const unrelatedCredit = createFieldingCredit(
            123457,
            0,
            0,
            0,
            300003
        )

        repository.put(firstCredit)
        repository.put(secondCredit)
        repository.put(unrelatedCredit)

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
                unrelatedCredit.gamePk,
                unrelatedCredit.atBatIndex,
                unrelatedCredit.runnerIndex,
                unrelatedCredit.creditIndex
            ),
            unrelatedCredit
        )
    })

    function createFieldingCredit(
        gamePk: number,
        atBatIndex: number,
        runnerIndex: number,
        creditIndex: number,
        playerId: number
    ): FieldingCredit {
        return {
            gamePk,
            atBatIndex,
            runnerIndex,
            creditIndex,
            playerId,
            credit: "putout",
            positionCode: "3",
            positionName: "First Base",
            positionType: "Infielder",
            positionAbbreviation: "1B"
        }
    }
})