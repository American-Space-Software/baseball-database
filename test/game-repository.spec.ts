import { strict as assert } from "assert"

import type { GameFeedResponse } from "mlb-stats-api"

import { afterEach, beforeEach, describe, it } from "mocha"

import { GameRepository } from "../src/repository/game-repository.js"
import type { Game } from "../src/repository/game-repository.js"
import { SchemaService } from "../src/service/schema-service.js"

describe("GameRepository", () => {

    let schemaService: SchemaService
    let repository: GameRepository

    beforeEach(() => {
        schemaService = new SchemaService(":memory:")
        repository = new GameRepository(schemaService.load())
    })

    afterEach(() => {
        schemaService.close()
    })

    it("returns undefined when the game does not exist", () => {
        const game = repository.get(123456)

        assert.equal(game, undefined)
    })

    it("stores and retrieves a game", () => {
        const game = createGame(123456, "Preview")

        repository.put(game)

        const loaded = repository.get(game.gamePk)

        assert.deepEqual(loaded, game)
    })

    it("replaces an existing game", () => {
        repository.put(createGame(123456, "Preview"))
        repository.put(createGame(123456, "Final"))

        assert.deepEqual(repository.get(123456), createGame(123456, "Final"))
    })

    function createGame(gamePk: number, detailedState: string): Game {
        return {
            gamePk,
            data: {
                gamePk,
                gameData: {
                    status: {
                        detailedState
                    }
                },
                liveData: {}
            } as GameFeedResponse
        }
    }
})