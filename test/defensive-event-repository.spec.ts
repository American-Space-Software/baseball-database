import { strict as assert } from "assert"

import Database from "better-sqlite3"
import { afterEach, beforeEach, describe, it } from "mocha"

import { DefensiveEventRepository } from "../src/repository/defensive-event-repository.js"

import type { DefensiveEvent } from "../src/repository/defensive-event-repository.js"

describe("DefensiveEventRepository", function () {

    let database: Database.Database
    let repository: DefensiveEventRepository

    beforeEach(function () {
        database = new Database(":memory:")

        database.exec(`
            CREATE TABLE games (
                game_pk INTEGER PRIMARY KEY,
                game_date TEXT NOT NULL
            );

            CREATE TABLE defensive_events (
                game_pk INTEGER NOT NULL,
                at_bat_index INTEGER NOT NULL,
                event_index INTEGER NOT NULL,
                team_id INTEGER NOT NULL,
                player_id INTEGER NOT NULL,
                event_type TEXT NOT NULL,
                from_position TEXT,
                to_position TEXT,
                PRIMARY KEY (
                    game_pk,
                    at_bat_index,
                    event_index,
                    player_id
                )
            );
        `)

        repository = new DefensiveEventRepository(database)
    })

    afterEach(function () {
        database.close()
    })

    it("returns undefined when the defensive event does not exist", function () {
        assert.equal(
            repository.get(123456, -1, -1, 101),
            undefined
        )
    })

    it("stores and retrieves a starting assignment", function () {
        const defensiveEvent: DefensiveEvent = {
            gamePk: 123456,
            atBatIndex: -1,
            eventIndex: -1,
            teamId: 10,
            playerId: 101,
            eventType: "starting_assignment",
            fromPosition: null,
            toPosition: "CF"
        }

        repository.put(defensiveEvent)

        assert.deepEqual(
            repository.get(123456, -1, -1, 101),
            defensiveEvent
        )
    })

    it("stores nullable position fields", function () {
        const defensiveEvent: DefensiveEvent = {
            gamePk: 123456,
            atBatIndex: 42,
            eventIndex: 3,
            teamId: 10,
            playerId: 101,
            eventType: "removal",
            fromPosition: null,
            toPosition: null
        }

        repository.put(defensiveEvent)

        assert.deepEqual(
            repository.get(123456, 42, 3, 101),
            defensiveEvent
        )
    })

    it("stores a defensive substitution", function () {
        const defensiveEvent: DefensiveEvent = {
            gamePk: 123456,
            atBatIndex: 42,
            eventIndex: 3,
            teamId: 10,
            playerId: 102,
            eventType: "defensive_substitution",
            fromPosition: null,
            toPosition: "LF"
        }

        repository.put(defensiveEvent)

        assert.deepEqual(
            repository.get(123456, 42, 3, 102),
            defensiveEvent
        )
    })

    it("stores a position switch", function () {
        const defensiveEvent: DefensiveEvent = {
            gamePk: 123456,
            atBatIndex: 42,
            eventIndex: 4,
            teamId: 10,
            playerId: 103,
            eventType: "position_switch",
            fromPosition: "LF",
            toPosition: "CF"
        }

        repository.put(defensiveEvent)

        assert.deepEqual(
            repository.get(123456, 42, 4, 103),
            defensiveEvent
        )
    })

    it("stores a pitching change", function () {
        const defensiveEvent: DefensiveEvent = {
            gamePk: 123456,
            atBatIndex: 58,
            eventIndex: 0,
            teamId: 10,
            playerId: 201,
            eventType: "pitching_change",
            fromPosition: null,
            toPosition: "P"
        }

        repository.put(defensiveEvent)

        assert.deepEqual(
            repository.get(123456, 58, 0, 201),
            defensiveEvent
        )
    })

    it("replaces an existing defensive event with the same natural key", function () {
        repository.put({
            gamePk: 123456,
            atBatIndex: 42,
            eventIndex: 3,
            teamId: 10,
            playerId: 102,
            eventType: "defensive_substitution",
            fromPosition: null,
            toPosition: "LF"
        })

        const replacement: DefensiveEvent = {
            gamePk: 123456,
            atBatIndex: 42,
            eventIndex: 3,
            teamId: 20,
            playerId: 102,
            eventType: "position_switch",
            fromPosition: "RF",
            toPosition: "LF"
        }

        repository.put(replacement)

        assert.deepEqual(
            repository.get(123456, 42, 3, 102),
            replacement
        )

        assert.equal(
            repository.getByGame(123456).length,
            1
        )
    })

    it("keeps multiple players assigned during the same defensive event", function () {
        const firstEvent: DefensiveEvent = {
            gamePk: 123456,
            atBatIndex: -1,
            eventIndex: -1,
            teamId: 10,
            playerId: 101,
            eventType: "starting_assignment",
            fromPosition: null,
            toPosition: "CF"
        }

        const secondEvent: DefensiveEvent = {
            gamePk: 123456,
            atBatIndex: -1,
            eventIndex: -1,
            teamId: 10,
            playerId: 102,
            eventType: "starting_assignment",
            fromPosition: null,
            toPosition: "LF"
        }

        repository.put(firstEvent)
        repository.put(secondEvent)

        assert.deepEqual(
            repository.get(123456, -1, -1, 101),
            firstEvent
        )

        assert.deepEqual(
            repository.get(123456, -1, -1, 102),
            secondEvent
        )
    })

    it("keeps defensive events at different play locations", function () {
        const firstEvent: DefensiveEvent = {
            gamePk: 123456,
            atBatIndex: 42,
            eventIndex: 3,
            teamId: 10,
            playerId: 102,
            eventType: "defensive_substitution",
            fromPosition: null,
            toPosition: "CF"
        }

        const secondEvent: DefensiveEvent = {
            gamePk: 123456,
            atBatIndex: 43,
            eventIndex: 0,
            teamId: 10,
            playerId: 102,
            eventType: "position_switch",
            fromPosition: "CF",
            toPosition: "LF"
        }

        repository.put(firstEvent)
        repository.put(secondEvent)

        assert.deepEqual(
            repository.get(123456, 42, 3, 102),
            firstEvent
        )

        assert.deepEqual(
            repository.get(123456, 43, 0, 102),
            secondEvent
        )
    })

    it("returns defensive events for a game ordered by play location and player", function () {
        const startingCenterFielder: DefensiveEvent = {
            gamePk: 123456,
            atBatIndex: -1,
            eventIndex: -1,
            teamId: 10,
            playerId: 101,
            eventType: "starting_assignment",
            fromPosition: null,
            toPosition: "CF"
        }

        const startingLeftFielder: DefensiveEvent = {
            gamePk: 123456,
            atBatIndex: -1,
            eventIndex: -1,
            teamId: 10,
            playerId: 102,
            eventType: "starting_assignment",
            fromPosition: null,
            toPosition: "LF"
        }

        const substitution: DefensiveEvent = {
            gamePk: 123456,
            atBatIndex: 42,
            eventIndex: 3,
            teamId: 10,
            playerId: 103,
            eventType: "defensive_substitution",
            fromPosition: null,
            toPosition: "CF"
        }

        const positionSwitch: DefensiveEvent = {
            gamePk: 123456,
            atBatIndex: 42,
            eventIndex: 4,
            teamId: 10,
            playerId: 102,
            eventType: "position_switch",
            fromPosition: "LF",
            toPosition: "CF"
        }

        const pitchingChange: DefensiveEvent = {
            gamePk: 123456,
            atBatIndex: 58,
            eventIndex: 0,
            teamId: 10,
            playerId: 201,
            eventType: "pitching_change",
            fromPosition: null,
            toPosition: "P"
        }

        repository.put(pitchingChange)
        repository.put(positionSwitch)
        repository.put(startingLeftFielder)
        repository.put(substitution)
        repository.put(startingCenterFielder)

        assert.deepEqual(
            repository.getByGame(123456),
            [
                startingCenterFielder,
                startingLeftFielder,
                substitution,
                positionSwitch,
                pitchingChange
            ]
        )
    })

    it("does not return defensive events from another game", function () {
        const expectedEvent: DefensiveEvent = {
            gamePk: 123456,
            atBatIndex: -1,
            eventIndex: -1,
            teamId: 10,
            playerId: 101,
            eventType: "starting_assignment",
            fromPosition: null,
            toPosition: "CF"
        }

        repository.put(expectedEvent)

        repository.put({
            gamePk: 654321,
            atBatIndex: -1,
            eventIndex: -1,
            teamId: 20,
            playerId: 202,
            eventType: "starting_assignment",
            fromPosition: null,
            toPosition: "P"
        })

        assert.deepEqual(
            repository.getByGame(123456),
            [expectedEvent]
        )
    })

    it("returns an empty array when a game has no defensive events", function () {
        assert.deepEqual(
            repository.getByGame(123456),
            []
        )
    })

    it("deletes all defensive events for a game", function () {
        repository.put({
            gamePk: 123456,
            atBatIndex: -1,
            eventIndex: -1,
            teamId: 10,
            playerId: 101,
            eventType: "starting_assignment",
            fromPosition: null,
            toPosition: "CF"
        })

        repository.put({
            gamePk: 123456,
            atBatIndex: 42,
            eventIndex: 3,
            teamId: 10,
            playerId: 102,
            eventType: "defensive_substitution",
            fromPosition: null,
            toPosition: "CF"
        })

        repository.put({
            gamePk: 654321,
            atBatIndex: -1,
            eventIndex: -1,
            teamId: 20,
            playerId: 201,
            eventType: "starting_assignment",
            fromPosition: null,
            toPosition: "P"
        })

        repository.deleteByGame(123456)

        assert.deepEqual(
            repository.getByGame(123456),
            []
        )

        assert.equal(
            repository.getByGame(654321).length,
            1
        )
    })

    it("returns defensive events within the requested date range", function () {
        insertGame(100001, "2026-07-01")
        insertGame(100002, "2026-07-02")
        insertGame(100003, "2026-07-03")

        const firstEvent: DefensiveEvent = {
            gamePk: 100001,
            atBatIndex: -1,
            eventIndex: -1,
            teamId: 10,
            playerId: 101,
            eventType: "starting_assignment",
            fromPosition: null,
            toPosition: "CF"
        }

        const secondEvent: DefensiveEvent = {
            gamePk: 100002,
            atBatIndex: 42,
            eventIndex: 3,
            teamId: 20,
            playerId: 202,
            eventType: "defensive_substitution",
            fromPosition: null,
            toPosition: "LF"
        }

        const thirdEvent: DefensiveEvent = {
            gamePk: 100003,
            atBatIndex: 58,
            eventIndex: 0,
            teamId: 30,
            playerId: 303,
            eventType: "pitching_change",
            fromPosition: null,
            toPosition: "P"
        }

        repository.put(firstEvent)
        repository.put(secondEvent)
        repository.put(thirdEvent)

        assert.deepEqual(
            repository.getByDateRange("2026-07-01", "2026-07-03"),
            [
                firstEvent,
                secondEvent
            ]
        )
    })

    it("includes the start date and excludes the end date", function () {
        insertGame(100001, "2026-07-01")
        insertGame(100002, "2026-07-02")

        const startDateEvent: DefensiveEvent = {
            gamePk: 100001,
            atBatIndex: -1,
            eventIndex: -1,
            teamId: 10,
            playerId: 101,
            eventType: "starting_assignment",
            fromPosition: null,
            toPosition: "CF"
        }

        const endDateEvent: DefensiveEvent = {
            gamePk: 100002,
            atBatIndex: -1,
            eventIndex: -1,
            teamId: 20,
            playerId: 202,
            eventType: "starting_assignment",
            fromPosition: null,
            toPosition: "P"
        }

        repository.put(startDateEvent)
        repository.put(endDateEvent)

        assert.deepEqual(
            repository.getByDateRange("2026-07-01", "2026-07-02"),
            [startDateEvent]
        )
    })

    it("returns defensive events ordered by game date, game, play location, and player", function () {
        insertGame(100002, "2026-07-02")
        insertGame(100001, "2026-07-01")

        const firstEvent: DefensiveEvent = {
            gamePk: 100001,
            atBatIndex: -1,
            eventIndex: -1,
            teamId: 10,
            playerId: 101,
            eventType: "starting_assignment",
            fromPosition: null,
            toPosition: "CF"
        }

        const secondEvent: DefensiveEvent = {
            gamePk: 100001,
            atBatIndex: -1,
            eventIndex: -1,
            teamId: 10,
            playerId: 102,
            eventType: "starting_assignment",
            fromPosition: null,
            toPosition: "LF"
        }

        const thirdEvent: DefensiveEvent = {
            gamePk: 100001,
            atBatIndex: 42,
            eventIndex: 3,
            teamId: 10,
            playerId: 103,
            eventType: "defensive_substitution",
            fromPosition: null,
            toPosition: "CF"
        }

        const fourthEvent: DefensiveEvent = {
            gamePk: 100002,
            atBatIndex: -1,
            eventIndex: -1,
            teamId: 20,
            playerId: 201,
            eventType: "starting_assignment",
            fromPosition: null,
            toPosition: "P"
        }

        repository.put(fourthEvent)
        repository.put(thirdEvent)
        repository.put(secondEvent)
        repository.put(firstEvent)

        assert.deepEqual(
            repository.getByDateRange("2026-07-01", "2026-07-03"),
            [
                firstEvent,
                secondEvent,
                thirdEvent,
                fourthEvent
            ]
        )
    })

    it("returns an empty array when no defensive events are in the requested date range", function () {
        insertGame(100001, "2026-07-01")

        repository.put({
            gamePk: 100001,
            atBatIndex: -1,
            eventIndex: -1,
            teamId: 10,
            playerId: 101,
            eventType: "starting_assignment",
            fromPosition: null,
            toPosition: "CF"
        })

        assert.deepEqual(
            repository.getByDateRange("2026-07-02", "2026-07-03"),
            []
        )
    })

    function insertGame(gamePk: number, gameDate: string): void {
        database.prepare(`
            INSERT INTO games (
                game_pk,
                game_date
            )
            VALUES (?, ?)
        `).run(gamePk, gameDate)
    }
})