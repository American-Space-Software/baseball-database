import { strict as assert } from "assert"

import { afterEach, beforeEach, describe, it } from "mocha"

import {
    PlateAppearanceRepository
} from "../src/repository/plate-appearance-repository.js"

import type {
    PlateAppearance
} from "../src/repository/plate-appearance-repository.js"

import { SchemaService } from "../src/service/schema-service.js"

describe("PlateAppearanceRepository", function () {

    let schemaService: SchemaService
    let repository: PlateAppearanceRepository

    beforeEach(function () {
        schemaService = new SchemaService(
            ":memory:"
        )

        const database = schemaService.load()

        repository = new PlateAppearanceRepository(
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
    })

    afterEach(function () {
        schemaService.close()
    })

    it("returns undefined when the plate appearance does not exist", function () {
        assert.equal(
            repository.get(
                123456,
                0
            ),
            undefined
        )
    })

    it("stores and retrieves a plate appearance", function () {
        const plateAppearance = createPlateAppearance(
            123456,
            0,
            1,
            "top",
            true,
            100001,
            200001
        )

        repository.put(
            plateAppearance
        )

        assert.deepEqual(
            repository.get(
                plateAppearance.gamePk,
                plateAppearance.atBatIndex
            ),
            plateAppearance
        )
    })

    it("returns boolean values after retrieval", function () {
        const plateAppearance = createPlateAppearance(
            123456,
            0,
            1,
            "top",
            true,
            100001,
            200001
        )

        repository.put(
            plateAppearance
        )

        const storedPlateAppearance = repository.get(
            plateAppearance.gamePk,
            plateAppearance.atBatIndex
        )

        assert.equal(
            storedPlateAppearance?.isTopInning,
            true
        )

        assert.equal(
            storedPlateAppearance?.isComplete,
            true
        )

        assert.equal(
            typeof storedPlateAppearance?.isTopInning,
            "boolean"
        )

        assert.equal(
            typeof storedPlateAppearance?.isComplete,
            "boolean"
        )
    })

    it("replaces an existing plate appearance", function () {
        repository.put(
            createPlateAppearance(
                123456,
                0,
                1,
                "top",
                true,
                100001,
                200001
            )
        )

        const replacement = {
            ...createPlateAppearance(
                123456,
                0,
                1,
                "top",
                true,
                100001,
                200002
            ),
            resultType: "atBat",
            event: "Home Run",
            eventType: "home_run",
            description: "Batter homers.",
            rbi: 2,
            awayScore: 2,
            homeScore: 0,
            balls: 3,
            strikes: 2,
            outs: 1,
            endTime: "2026-07-20T17:06:00.000Z",
            isComplete: true
        }

        repository.put(
            replacement
        )

        assert.deepEqual(
            repository.get(
                123456,
                0
            ),
            replacement
        )
    })

    it("returns plate appearances for a game", function () {
        const thirdPlateAppearance = createPlateAppearance(
            123456,
            2,
            1,
            "top",
            true,
            100003,
            200001
        )

        const firstPlateAppearance = createPlateAppearance(
            123456,
            0,
            1,
            "top",
            true,
            100001,
            200001
        )

        const secondPlateAppearance = createPlateAppearance(
            123456,
            1,
            1,
            "top",
            true,
            100002,
            200001
        )

        const unrelatedPlateAppearance = createPlateAppearance(
            123457,
            0,
            1,
            "top",
            true,
            100004,
            200002
        )

        repository.put(thirdPlateAppearance)
        repository.put(firstPlateAppearance)
        repository.put(secondPlateAppearance)
        repository.put(unrelatedPlateAppearance)

        assert.deepEqual(
            repository.getByGame(
                123456
            ),
            [
                firstPlateAppearance,
                secondPlateAppearance,
                thirdPlateAppearance
            ]
        )
    })

    it("returns an empty array when a game has no plate appearances", function () {
        assert.deepEqual(
            repository.getByGame(
                123456
            ),
            []
        )
    })

    it("returns plate appearances for a batter", function () {
        const secondPlateAppearance = createPlateAppearance(
            123457,
            0,
            1,
            "top",
            true,
            100001,
            200002
        )

        const firstPlateAppearance = createPlateAppearance(
            123456,
            2,
            1,
            "top",
            true,
            100001,
            200001
        )

        const earlierPlateAppearance = createPlateAppearance(
            123456,
            0,
            1,
            "top",
            true,
            100001,
            200001
        )

        const unrelatedPlateAppearance = createPlateAppearance(
            123456,
            1,
            1,
            "top",
            true,
            100002,
            200001
        )

        repository.put(secondPlateAppearance)
        repository.put(firstPlateAppearance)
        repository.put(earlierPlateAppearance)
        repository.put(unrelatedPlateAppearance)

        assert.deepEqual(
            repository.getByBatter(
                100001
            ),
            [
                earlierPlateAppearance,
                firstPlateAppearance,
                secondPlateAppearance
            ]
        )
    })

    it("returns an empty array when a batter has no plate appearances", function () {
        assert.deepEqual(
            repository.getByBatter(
                100001
            ),
            []
        )
    })

    it("returns plate appearances for a pitcher", function () {
        const secondPlateAppearance = createPlateAppearance(
            123457,
            0,
            1,
            "top",
            true,
            100003,
            200001
        )

        const firstPlateAppearance = createPlateAppearance(
            123456,
            2,
            1,
            "top",
            true,
            100002,
            200001
        )

        const earlierPlateAppearance = createPlateAppearance(
            123456,
            0,
            1,
            "top",
            true,
            100001,
            200001
        )

        const unrelatedPlateAppearance = createPlateAppearance(
            123456,
            1,
            1,
            "top",
            true,
            100004,
            200002
        )

        repository.put(secondPlateAppearance)
        repository.put(firstPlateAppearance)
        repository.put(earlierPlateAppearance)
        repository.put(unrelatedPlateAppearance)

        assert.deepEqual(
            repository.getByPitcher(
                200001
            ),
            [
                earlierPlateAppearance,
                firstPlateAppearance,
                secondPlateAppearance
            ]
        )
    })

    it("returns an empty array when a pitcher has no plate appearances", function () {
        assert.deepEqual(
            repository.getByPitcher(
                200001
            ),
            []
        )
    })

    it("returns plate appearances within the requested date range", function () {
        const firstPlateAppearance = createPlateAppearance(
            123456,
            0,
            1,
            "top",
            true,
            100001,
            200001
        )

        const secondPlateAppearance = createPlateAppearance(
            123457,
            0,
            1,
            "top",
            true,
            100002,
            200002
        )

        const endDatePlateAppearance = createPlateAppearance(
            123458,
            0,
            1,
            "top",
            true,
            100003,
            200003
        )

        repository.put(firstPlateAppearance)
        repository.put(secondPlateAppearance)
        repository.put(endDatePlateAppearance)

        assert.deepEqual(
            repository.getByDateRange(
                "2026-07-01",
                "2026-07-03"
            ),
            [
                firstPlateAppearance,
                secondPlateAppearance
            ]
        )
    })

    it("includes the start date and excludes the end date", function () {
        const startDatePlateAppearance = createPlateAppearance(
            123456,
            0,
            1,
            "top",
            true,
            100001,
            200001
        )

        const endDatePlateAppearance = createPlateAppearance(
            123457,
            0,
            1,
            "top",
            true,
            100002,
            200002
        )

        repository.put(startDatePlateAppearance)
        repository.put(endDatePlateAppearance)

        assert.deepEqual(
            repository.getByDateRange(
                "2026-07-01",
                "2026-07-02"
            ),
            [
                startDatePlateAppearance
            ]
        )
    })

    it("returns plate appearances ordered by date, game, and plate appearance", function () {
        const fourthPlateAppearance = createPlateAppearance(
            123457,
            0,
            1,
            "top",
            true,
            100004,
            200001
        )

        const thirdPlateAppearance = createPlateAppearance(
            123456,
            2,
            1,
            "top",
            true,
            100003,
            200001
        )

        const secondPlateAppearance = createPlateAppearance(
            123456,
            1,
            1,
            "top",
            true,
            100002,
            200001
        )

        const firstPlateAppearance = createPlateAppearance(
            123456,
            0,
            1,
            "top",
            true,
            100001,
            200001
        )

        repository.put(fourthPlateAppearance)
        repository.put(thirdPlateAppearance)
        repository.put(secondPlateAppearance)
        repository.put(firstPlateAppearance)

        assert.deepEqual(
            repository.getByDateRange(
                "2026-07-01",
                "2026-07-03"
            ),
            [
                firstPlateAppearance,
                secondPlateAppearance,
                thirdPlateAppearance,
                fourthPlateAppearance
            ]
        )
    })

    it("returns an empty array when no plate appearances are within the requested date range", function () {
        repository.put(
            createPlateAppearance(
                123456,
                0,
                1,
                "top",
                true,
                100001,
                200001
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

    it("deletes all plate appearances for a game", function () {
        const firstPlateAppearance = createPlateAppearance(
            123456,
            0,
            1,
            "top",
            true,
            100001,
            200001
        )

        const secondPlateAppearance = createPlateAppearance(
            123456,
            1,
            1,
            "top",
            true,
            100002,
            200001
        )

        const unrelatedPlateAppearance = createPlateAppearance(
            123457,
            0,
            1,
            "top",
            true,
            100003,
            200002
        )

        repository.put(firstPlateAppearance)
        repository.put(secondPlateAppearance)
        repository.put(unrelatedPlateAppearance)

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
                unrelatedPlateAppearance.gamePk,
                unrelatedPlateAppearance.atBatIndex
            ),
            unrelatedPlateAppearance
        )
    })

    function createPlateAppearance(
        gamePk: number,
        atBatIndex: number,
        inning: number,
        halfInning: string,
        isTopInning: boolean,
        batterId: number,
        pitcherId: number
    ): PlateAppearance {
        return {
            gamePk,
            atBatIndex,
            inning,
            halfInning,
            isTopInning,
            batterId,
            pitcherId,
            batSideCode: "R",
            pitchHandCode: "R",
            resultType: "atBat",
            event: "Single",
            eventType: "single",
            description: "Batter singles on a ground ball.",
            rbi: 0,
            awayScore: 0,
            homeScore: 0,
            balls: 1,
            strikes: 2,
            outs: 0,
            startTime: "2026-07-20T17:05:00.000Z",
            endTime: "2026-07-20T17:05:30.000Z",
            isComplete: true
        }
    }
})