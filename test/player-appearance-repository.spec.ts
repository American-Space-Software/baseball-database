import { strict as assert } from "assert"

import { afterEach, beforeEach, describe, it } from "mocha"

import {
    PlayerAppearanceRepository
} from "../src/repository/player-appearance-repository.js"

import type {
    PlayerAppearance
} from "../src/repository/player-appearance-repository.js"

import { SchemaService } from "../src/service/schema-service.js"

describe("PlayerAppearanceRepository", function () {

    let schemaService: SchemaService
    let repository: PlayerAppearanceRepository

    beforeEach(function () {
        schemaService = new SchemaService(
            ":memory:"
        )

        const database = schemaService.load()

        repository = new PlayerAppearanceRepository(
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

    it("returns undefined when the appearance does not exist", function () {
        assert.equal(
            repository.get(
                123456,
                100001
            ),
            undefined
        )
    })

    it("stores and retrieves a player appearance", function () {
        const appearance = createAppearance(
            123456,
            100001,
            134,
            true,
            false,
            true,
            true,
            true,
            false,
            true
        )

        repository.put(
            appearance
        )

        assert.deepEqual(
            repository.get(
                appearance.gamePk,
                appearance.playerId
            ),
            appearance
        )
    })

    it("returns boolean values after retrieval", function () {
        const appearance = createAppearance(
            123456,
            100001,
            134,
            true,
            false,
            true,
            false,
            true,
            false,
            true
        )

        repository.put(
            appearance
        )

        const storedAppearance = repository.get(
            appearance.gamePk,
            appearance.playerId
        )

        assert.equal(
            storedAppearance?.appearedAsBatter,
            true
        )

        assert.equal(
            storedAppearance?.appearedAsPitcher,
            false
        )

        assert.equal(
            typeof storedAppearance?.appearedAsBatter,
            "boolean"
        )

        assert.equal(
            typeof storedAppearance?.appearedAsPitcher,
            "boolean"
        )
    })

    it("replaces an existing player appearance", function () {
        repository.put(
            createAppearance(
                123456,
                100001,
                134,
                true,
                false,
                false,
                true,
                true,
                false,
                true
            )
        )

        repository.put(
            createAppearance(
                123456,
                100001,
                147,
                false,
                true,
                true,
                false,
                false,
                true,
                false
            )
        )

        assert.deepEqual(
            repository.get(
                123456,
                100001
            ),
            createAppearance(
                123456,
                100001,
                147,
                false,
                true,
                true,
                false,
                false,
                true,
                false
            )
        )
    })

    it("returns player appearances for a game", function () {
        const firstAppearance = createAppearance(
            123456,
            100003,
            147,
            true,
            false,
            false,
            true,
            true,
            false,
            true
        )

        const secondAppearance = createAppearance(
            123456,
            100001,
            134,
            true,
            false,
            true,
            true,
            true,
            false,
            true
        )

        const thirdAppearance = createAppearance(
            123456,
            100002,
            134,
            false,
            true,
            false,
            true,
            false,
            true,
            true
        )

        const unrelatedAppearance = createAppearance(
            123457,
            100004,
            158,
            true,
            false,
            false,
            true,
            true,
            false,
            true
        )

        repository.put(firstAppearance)
        repository.put(secondAppearance)
        repository.put(thirdAppearance)
        repository.put(unrelatedAppearance)

        assert.deepEqual(
            repository.getByGame(
                123456
            ),
            [
                secondAppearance,
                thirdAppearance,
                firstAppearance
            ]
        )
    })

    it("returns an empty array when a game has no player appearances", function () {
        assert.deepEqual(
            repository.getByGame(
                123456
            ),
            []
        )
    })

    it("returns appearances for a player", function () {
        const firstAppearance = createAppearance(
            123457,
            100001,
            134,
            true,
            false,
            false,
            true,
            true,
            false,
            true
        )

        const secondAppearance = createAppearance(
            123456,
            100001,
            134,
            true,
            false,
            true,
            true,
            true,
            false,
            true
        )

        const unrelatedAppearance = createAppearance(
            123456,
            100002,
            134,
            false,
            true,
            false,
            true,
            false,
            true,
            true
        )

        repository.put(firstAppearance)
        repository.put(secondAppearance)
        repository.put(unrelatedAppearance)

        assert.deepEqual(
            repository.getByPlayer(
                100001
            ),
            [
                secondAppearance,
                firstAppearance
            ]
        )
    })

    it("returns an empty array when a player has no appearances", function () {
        assert.deepEqual(
            repository.getByPlayer(
                100001
            ),
            []
        )
    })

    it("returns player appearances within the requested date range", function () {
        const firstAppearance = createAppearance(
            123456,
            100001,
            134,
            true,
            false,
            false,
            true,
            true,
            false,
            true
        )

        const secondAppearance = createAppearance(
            123457,
            100002,
            147,
            false,
            true,
            false,
            true,
            false,
            true,
            true
        )

        const endDateAppearance = createAppearance(
            123458,
            100003,
            158,
            true,
            false,
            true,
            true,
            true,
            false,
            true
        )

        repository.put(firstAppearance)
        repository.put(secondAppearance)
        repository.put(endDateAppearance)

        assert.deepEqual(
            repository.getByDateRange(
                "2026-07-01",
                "2026-07-03"
            ),
            [
                firstAppearance,
                secondAppearance
            ]
        )
    })

    it("includes the start date and excludes the end date", function () {
        const startDateAppearance = createAppearance(
            123456,
            100001,
            134,
            true,
            false,
            false,
            true,
            true,
            false,
            true
        )

        const endDateAppearance = createAppearance(
            123457,
            100002,
            147,
            false,
            true,
            false,
            true,
            false,
            true,
            true
        )

        repository.put(startDateAppearance)
        repository.put(endDateAppearance)

        assert.deepEqual(
            repository.getByDateRange(
                "2026-07-01",
                "2026-07-02"
            ),
            [
                startDateAppearance
            ]
        )
    })

    it("returns player appearances ordered by date, game, team, and player", function () {
        const fourthAppearance = createAppearance(
            123457,
            100004,
            134,
            true,
            false,
            false,
            true,
            true,
            false,
            true
        )

        const thirdAppearance = createAppearance(
            123456,
            100003,
            147,
            true,
            false,
            false,
            true,
            true,
            false,
            true
        )

        const secondAppearance = createAppearance(
            123456,
            100002,
            134,
            false,
            true,
            false,
            true,
            false,
            true,
            true
        )

        const firstAppearance = createAppearance(
            123456,
            100001,
            134,
            true,
            false,
            true,
            true,
            true,
            false,
            true
        )

        repository.put(fourthAppearance)
        repository.put(thirdAppearance)
        repository.put(secondAppearance)
        repository.put(firstAppearance)

        assert.deepEqual(
            repository.getByDateRange(
                "2026-07-01",
                "2026-07-03"
            ),
            [
                firstAppearance,
                secondAppearance,
                thirdAppearance,
                fourthAppearance
            ]
        )
    })

    it("returns an empty array when no player appearances are within the requested date range", function () {
        repository.put(
            createAppearance(
                123456,
                100001,
                134,
                true,
                false,
                false,
                true,
                true,
                false,
                true
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

    it("deletes all player appearances for a game", function () {
        const firstAppearance = createAppearance(
            123456,
            100001,
            134,
            true,
            false,
            false,
            true,
            true,
            false,
            true
        )

        const secondAppearance = createAppearance(
            123456,
            100002,
            134,
            false,
            true,
            false,
            true,
            false,
            true,
            true
        )

        const unrelatedAppearance = createAppearance(
            123457,
            100003,
            147,
            true,
            false,
            true,
            true,
            true,
            false,
            true
        )

        repository.put(firstAppearance)
        repository.put(secondAppearance)
        repository.put(unrelatedAppearance)

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
                unrelatedAppearance.gamePk,
                unrelatedAppearance.playerId
            ),
            unrelatedAppearance
        )
    })

    function createAppearance(
        gamePk: number,
        playerId: number,
        teamId: number,
        appearedAsBatter: boolean,
        appearedAsPitcher: boolean,
        appearedAsRunner: boolean,
        appearedAsFielder: boolean,
        startedAsBatter: boolean,
        startedAsPitcher: boolean,
        startedAsFielder: boolean
    ): PlayerAppearance {
        return {
            gamePk,
            playerId,
            teamId,
            appearedAsBatter,
            appearedAsPitcher,
            appearedAsRunner,
            appearedAsFielder,
            startedAsBatter,
            startedAsPitcher,
            startedAsFielder
        }
    }
})