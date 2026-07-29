import { strict as assert } from "assert"

import type { GameFeedResponse } from "mlb-stats-api"

import { afterEach, beforeEach, describe, it } from "mocha"

import { GameRepository } from "../src/repository/game-repository.js"

import type {
    Game
} from "../src/repository/game-repository.js"

import { SchemaService } from "../src/service/schema-service.js"

describe("GameRepository", function () {

    let schemaService: SchemaService
    let repository: GameRepository

    beforeEach(function () {
        schemaService = new SchemaService(
            ":memory:"
        )

        repository = new GameRepository(
            schemaService.load()
        )
    })

    afterEach(function () {
        schemaService.close()
    })

    it("returns undefined when the game does not exist", function () {
        assert.equal(
            repository.get(
                123456
            ),
            undefined
        )
    })

    it("stores and retrieves a game", function () {
        const game = createGame(
            123456,
            "2026-07-20",
            "Preview",
            "Preview",
            "P",
            "P"
        )

        repository.put(
            game
        )

        assert.deepEqual(
            repository.get(
                game.gamePk
            ),
            game
        )
    })

    it("replaces an existing game", function () {
        repository.put(
            createGame(
                123456,
                "2026-07-20",
                "Preview",
                "Preview",
                "P",
                "P"
            )
        )

        repository.put(
            createGame(
                123456,
                "2026-07-20",
                "Final",
                "Final",
                "F",
                "F"
            )
        )

        assert.deepEqual(
            repository.get(
                123456
            ),
            createGame(
                123456,
                "2026-07-20",
                "Final",
                "Final",
                "F",
                "F"
            )
        )
    })

    it("returns an empty array when no game PKs are supplied", function () {
        assert.deepEqual(
            repository.getByPks(
                []
            ),
            []
        )
    })

    it("returns games matching the supplied game PKs", function () {
        const firstGame = createGame(
            100001,
            "2026-07-20",
            "Preview",
            "Preview",
            "P",
            "P"
        )

        const secondGame = createGame(
            100002,
            "2026-07-20",
            "Final",
            "Final",
            "F",
            "F"
        )

        const unrelatedGame = createGame(
            100003,
            "2026-07-20",
            "Final",
            "Final",
            "F",
            "F"
        )

        repository.put(firstGame)
        repository.put(secondGame)
        repository.put(unrelatedGame)

        assert.deepEqual(
            repository.getByPks([
                firstGame.gamePk,
                secondGame.gamePk
            ]),
            [
                firstGame,
                secondGame
            ]
        )
    })

    it("omits game PKs that are not stored", function () {
        const storedGame = createGame(
            100001,
            "2026-07-20",
            "Final",
            "Final",
            "F",
            "F"
        )

        repository.put(
            storedGame
        )

        assert.deepEqual(
            repository.getByPks([
                storedGame.gamePk,
                999999
            ]),
            [
                storedGame
            ]
        )
    })

    it("returns all requested games", function () {
        const games = Array.from(
            { length: 1200 },
            (_, index) =>
                createGame(
                    200000 + index,
                    "2026-07-20",
                    index % 2 === 0
                        ? "Preview"
                        : "Final",
                    index % 2 === 0
                        ? "Preview"
                        : "Final",
                    index % 2 === 0
                        ? "P"
                        : "F",
                    index % 2 === 0
                        ? "P"
                        : "F"
                )
        )

        for (const game of games) {
            repository.put(
                game
            )
        }

        assert.deepEqual(
            repository.getByPks(
                games.map(game => game.gamePk)
            ),
            games
        )
    })

    it("returns games within the requested date range", function () {
        const beforeRange = createGame(
            1,
            "2026-07-19",
            "Final",
            "Final",
            "F",
            "F"
        )

        const firstGame = createGame(
            2,
            "2026-07-20",
            "Preview",
            "Preview",
            "P",
            "P"
        )

        const secondGame = createGame(
            3,
            "2026-07-21",
            "Final",
            "Final",
            "F",
            "F"
        )

        const endDateGame = createGame(
            4,
            "2026-07-22",
            "Final",
            "Final",
            "F",
            "F"
        )

        repository.put(beforeRange)
        repository.put(firstGame)
        repository.put(secondGame)
        repository.put(endDateGame)

        assert.deepEqual(
            repository.getByDateRange(
                "2026-07-20",
                "2026-07-22"
            ),
            [
                firstGame,
                secondGame
            ]
        )
    })

    it("returns games within a date range ordered by date and game PK", function () {
        const fourthGame = createGame(
            20,
            "2026-07-21",
            "Final",
            "Final",
            "F",
            "F"
        )

        const secondGame = createGame(
            30,
            "2026-07-20",
            "Final",
            "Final",
            "F",
            "F"
        )

        const thirdGame = createGame(
            10,
            "2026-07-21",
            "Preview",
            "Preview",
            "P",
            "P"
        )

        const firstGame = createGame(
            5,
            "2026-07-20",
            "Preview",
            "Preview",
            "P",
            "P"
        )

        repository.put(fourthGame)
        repository.put(secondGame)
        repository.put(thirdGame)
        repository.put(firstGame)

        assert.deepEqual(
            repository.getByDateRange(
                "2026-07-20",
                "2026-07-22"
            ),
            [
                firstGame,
                secondGame,
                thirdGame,
                fourthGame
            ]
        )
    })

    it("returns an empty array when no games exist within the date range", function () {
        repository.put(
            createGame(
                1,
                "2026-07-19",
                "Final",
                "Final",
                "F",
                "F"
            )
        )

        repository.put(
            createGame(
                2,
                "2026-07-22",
                "Final",
                "Final",
                "F",
                "F"
            )
        )

        assert.deepEqual(
            repository.getByDateRange(
                "2026-07-20",
                "2026-07-22"
            ),
            []
        )
    })

    it("returns completed games for a date", function () {
        const completed = createGame(
            1,
            "2026-07-20",
            "Final",
            "Final",
            "F",
            "F"
        )

        const preview = createGame(
            2,
            "2026-07-20",
            "Preview",
            "Preview",
            "P",
            "P"
        )

        const postponed = createGame(
            3,
            "2026-07-20",
            "Final",
            "Postponed",
            "D",
            "DR"
        )

        const otherDate = createGame(
            4,
            "2026-07-21",
            "Final",
            "Final",
            "F",
            "F"
        )

        repository.put(completed)
        repository.put(preview)
        repository.put(postponed)
        repository.put(otherDate)

        assert.deepEqual(
            repository.getCompletedByDate(
                "2026-07-20"
            ),
            [
                completed
            ]
        )
    })

    it("returns completed games within the requested date range", function () {
        const beforeRange = createGame(
            1,
            "2026-07-19",
            "Final",
            "Final",
            "F",
            "F"
        )

        const firstCompleted = createGame(
            2,
            "2026-07-20",
            "Final",
            "Final",
            "F",
            "F"
        )

        const secondCompleted = createGame(
            3,
            "2026-07-21",
            "Final",
            "Final",
            "F",
            "F"
        )

        const endDateGame = createGame(
            4,
            "2026-07-22",
            "Final",
            "Final",
            "F",
            "F"
        )

        repository.put(beforeRange)
        repository.put(firstCompleted)
        repository.put(secondCompleted)
        repository.put(endDateGame)

        assert.deepEqual(
            repository.getCompletedByDateRange(
                "2026-07-20",
                "2026-07-22"
            ),
            [
                firstCompleted,
                secondCompleted
            ]
        )
    })

    it("excludes noncompleted games from a completed game date range", function () {
        const completed = createGame(
            1,
            "2026-07-20",
            "Final",
            "Final",
            "F",
            "F"
        )

        repository.put(completed)

        repository.put(
            createGame(
                2,
                "2026-07-20",
                "Preview",
                "Preview",
                "P",
                "P"
            )
        )

        repository.put(
            createGame(
                3,
                "2026-07-21",
                "Live",
                "In Progress",
                "I",
                "I"
            )
        )

        repository.put(
            createGame(
                4,
                "2026-07-21",
                "Final",
                "Postponed",
                "D",
                "DR"
            )
        )

        repository.put(
            createGame(
                5,
                "2026-07-21",
                "Final",
                "Cancelled",
                "D",
                "D"
            )
        )

        repository.put(
            createGame(
                6,
                "2026-07-21",
                "Final",
                "Suspended",
                "D",
                "D"
            )
        )

        assert.deepEqual(
            repository.getCompletedByDateRange(
                "2026-07-20",
                "2026-07-22"
            ),
            [
                completed
            ]
        )
    })

    it("returns completed games ordered by date and game PK", function () {
        const fourthGame = createGame(
            20,
            "2026-07-21",
            "Final",
            "Final",
            "F",
            "F"
        )

        const secondGame = createGame(
            30,
            "2026-07-20",
            "Final",
            "Final",
            "F",
            "F"
        )

        const thirdGame = createGame(
            10,
            "2026-07-21",
            "Final",
            "Final",
            "F",
            "F"
        )

        const firstGame = createGame(
            5,
            "2026-07-20",
            "Final",
            "Final",
            "F",
            "F"
        )

        repository.put(fourthGame)
        repository.put(secondGame)
        repository.put(thirdGame)
        repository.put(firstGame)

        assert.deepEqual(
            repository.getCompletedByDateRange(
                "2026-07-20",
                "2026-07-22"
            ),
            [
                firstGame,
                secondGame,
                thirdGame,
                fourthGame
            ]
        )
    })

    it("returns an empty array when no completed games exist within the date range", function () {
        repository.put(
            createGame(
                1,
                "2026-07-20",
                "Preview",
                "Preview",
                "P",
                "P"
            )
        )

        repository.put(
            createGame(
                2,
                "2026-07-22",
                "Final",
                "Final",
                "F",
                "F"
            )
        )

        assert.deepEqual(
            repository.getCompletedByDateRange(
                "2026-07-20",
                "2026-07-22"
            ),
            []
        )
    })

    it("returns completed game PKs for a date", function () {
        repository.put(
            createGame(
                3,
                "2026-07-20",
                "Final",
                "Final",
                "F",
                "F"
            )
        )

        repository.put(
            createGame(
                1,
                "2026-07-20",
                "Final",
                "Final",
                "F",
                "F"
            )
        )

        repository.put(
            createGame(
                2,
                "2026-07-20",
                "Preview",
                "Preview",
                "P",
                "P"
            )
        )

        repository.put(
            createGame(
                4,
                "2026-07-21",
                "Final",
                "Final",
                "F",
                "F"
            )
        )

        assert.deepEqual(
            repository.getCompletedGamePksByDate(
                "2026-07-20"
            ),
            [
                1,
                3
            ]
        )
    })

    it("returns completed game PKs within the requested date range", function () {
        repository.put(
            createGame(
                4,
                "2026-07-22",
                "Final",
                "Final",
                "F",
                "F"
            )
        )

        repository.put(
            createGame(
                2,
                "2026-07-20",
                "Final",
                "Final",
                "F",
                "F"
            )
        )

        repository.put(
            createGame(
                3,
                "2026-07-21",
                "Final",
                "Final",
                "F",
                "F"
            )
        )

        repository.put(
            createGame(
                1,
                "2026-07-19",
                "Final",
                "Final",
                "F",
                "F"
            )
        )

        assert.deepEqual(
            repository.getCompletedGamePksByDateRange(
                "2026-07-20",
                "2026-07-22"
            ),
            [
                2,
                3
            ]
        )
    })

    it("excludes noncompleted games from a completed game PK date range", function () {
        repository.put(
            createGame(
                1,
                "2026-07-20",
                "Final",
                "Final",
                "F",
                "F"
            )
        )

        repository.put(
            createGame(
                2,
                "2026-07-20",
                "Preview",
                "Preview",
                "P",
                "P"
            )
        )

        repository.put(
            createGame(
                3,
                "2026-07-21",
                "Live",
                "In Progress",
                "I",
                "I"
            )
        )

        repository.put(
            createGame(
                4,
                "2026-07-21",
                "Final",
                "Postponed",
                "D",
                "DR"
            )
        )

        repository.put(
            createGame(
                5,
                "2026-07-21",
                "Final",
                "Cancelled",
                "D",
                "D"
            )
        )

        repository.put(
            createGame(
                6,
                "2026-07-21",
                "Final",
                "Suspended",
                "D",
                "D"
            )
        )

        assert.deepEqual(
            repository.getCompletedGamePksByDateRange(
                "2026-07-20",
                "2026-07-22"
            ),
            [
                1
            ]
        )
    })

    it("returns completed game PKs ordered by date and game PK", function () {
        repository.put(
            createGame(
                20,
                "2026-07-21",
                "Final",
                "Final",
                "F",
                "F"
            )
        )

        repository.put(
            createGame(
                30,
                "2026-07-20",
                "Final",
                "Final",
                "F",
                "F"
            )
        )

        repository.put(
            createGame(
                10,
                "2026-07-21",
                "Final",
                "Final",
                "F",
                "F"
            )
        )

        repository.put(
            createGame(
                5,
                "2026-07-20",
                "Final",
                "Final",
                "F",
                "F"
            )
        )

        assert.deepEqual(
            repository.getCompletedGamePksByDateRange(
                "2026-07-20",
                "2026-07-22"
            ),
            [
                5,
                30,
                10,
                20
            ]
        )
    })

    it("returns an empty array when no completed game PKs exist within the date range", function () {
        repository.put(
            createGame(
                1,
                "2026-07-20",
                "Preview",
                "Preview",
                "P",
                "P"
            )
        )

        repository.put(
            createGame(
                2,
                "2026-07-22",
                "Final",
                "Final",
                "F",
                "F"
            )
        )

        assert.deepEqual(
            repository.getCompletedGamePksByDateRange(
                "2026-07-20",
                "2026-07-22"
            ),
            []
        )
    })

    function createGame(gamePk: number, gameDate: string, abstractGameState: string, detailedState: string, codedGameState: string, statusCode: string): Game {
        return {
            gamePk,
            data: {
                gamePk,
                gameData: {
                    datetime: {
                        officialDate: gameDate
                    },
                    status: {
                        abstractGameState,
                        detailedState,
                        codedGameState,
                        statusCode
                    }
                },
                liveData: {}
            } as GameFeedResponse,
            gameDate,
            abstractGameState,
            codedGameState,
            detailedState,
            statusCode
        }
    }
})