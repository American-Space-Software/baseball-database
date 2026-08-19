import assert from "assert"
import BetterSqlite3 from "better-sqlite3"

import { PlayerRepository } from "../src/repository/player-repository.js"
import type { Player } from "../src/repository/player-repository.js"


describe("PlayerRepository", () => {

    let database: BetterSqlite3.Database
    let repository: PlayerRepository

    beforeEach(() => {
        database = new BetterSqlite3(":memory:")

        database.exec(`
            CREATE TABLE players (
                player_id INTEGER PRIMARY KEY,
                first_name TEXT NOT NULL,
                last_name TEXT NOT NULL,
                full_name TEXT NOT NULL,
                primary_position TEXT,
                bats TEXT,
                throws TEXT,
                birth_date TEXT,
                birth_city TEXT,
                birth_country TEXT,
                height TEXT,
                weight INTEGER,
                mlb_debut_date TEXT,
                primary_number TEXT,
                nick_name TEXT
            )
        `)

        repository = new PlayerRepository(database)
    })

    afterEach(() => {
        database.close()
    })

    it("stores and retrieves a player", () => {
        const player: Player = {
            playerId: 592450,
            firstName: "Aaron",
            lastName: "Judge",
            fullName: "Aaron Judge",
            primaryPosition: "RF",
            bats: "R",
            throws: "R",
            birthDate: "1992-04-26",
            birthCity: "Linden",
            birthCountry: "USA",
            height: "6' 7\"",
            weight: 282,
            mlbDebutDate: "2016-08-13",
            primaryNumber: "99",
            nickName: null
        }

        repository.put(player)

        assert.deepStrictEqual(repository.get(592450), player)
    })

    it("updates an existing player", () => {
        repository.put({
            playerId: 592450,
            firstName: "Aaron",
            lastName: "Judge",
            fullName: "Aaron Judge",
            primaryPosition: "RF",
            bats: "R",
            throws: "R",
            birthDate: "1992-04-26",
            birthCity: "Linden",
            birthCountry: "USA",
            height: "6' 7\"",
            weight: 282,
            mlbDebutDate: "2016-08-13",
            primaryNumber: "99",
            nickName: null
        })

        repository.put({
            playerId: 592450,
            firstName: "Aaron",
            lastName: "Judge",
            fullName: "Aaron Judge",
            primaryPosition: "OF",
            bats: "R",
            throws: "R",
            birthDate: "1992-04-26",
            birthCity: "Linden",
            birthCountry: "USA",
            height: "6' 7\"",
            weight: 282,
            mlbDebutDate: "2016-08-13",
            primaryNumber: "99",
            nickName: "All Rise"
        })

        assert.deepStrictEqual(repository.get(592450), {
            playerId: 592450,
            firstName: "Aaron",
            lastName: "Judge",
            fullName: "Aaron Judge",
            primaryPosition: "OF",
            bats: "R",
            throws: "R",
            birthDate: "1992-04-26",
            birthCity: "Linden",
            birthCountry: "USA",
            height: "6' 7\"",
            weight: 282,
            mlbDebutDate: "2016-08-13",
            primaryNumber: "99",
            nickName: "All Rise"
        })
    })

    it("returns undefined when a player does not exist", () => {
        assert.strictEqual(repository.get(999999), undefined)
    })

    it("returns all players ordered by player id", () => {
        repository.put({
            playerId: 2,
            firstName: "Second",
            lastName: "Player",
            fullName: "Second Player",
            primaryPosition: "P",
            bats: "L",
            throws: "L",
            birthDate: "1990-01-01",
            birthCity: "Second City",
            birthCountry: "USA",
            height: "6' 2\"",
            weight: 210,
            mlbDebutDate: "2015-04-01",
            primaryNumber: "22",
            nickName: null
        })

        repository.put({
            playerId: 1,
            firstName: "First",
            lastName: "Player",
            fullName: "First Player",
            primaryPosition: "SS",
            bats: "R",
            throws: "R",
            birthDate: "1991-01-01",
            birthCity: "First City",
            birthCountry: "USA",
            height: "6' 0\"",
            weight: 190,
            mlbDebutDate: "2016-04-01",
            primaryNumber: "1",
            nickName: null
        })

        assert.deepStrictEqual(repository.getAll(), [
            {
                playerId: 1,
                firstName: "First",
                lastName: "Player",
                fullName: "First Player",
                primaryPosition: "SS",
                bats: "R",
                throws: "R",
                birthDate: "1991-01-01",
                birthCity: "First City",
                birthCountry: "USA",
                height: "6' 0\"",
                weight: 190,
                mlbDebutDate: "2016-04-01",
                primaryNumber: "1",
                nickName: null
            },
            {
                playerId: 2,
                firstName: "Second",
                lastName: "Player",
                fullName: "Second Player",
                primaryPosition: "P",
                bats: "L",
                throws: "L",
                birthDate: "1990-01-01",
                birthCity: "Second City",
                birthCountry: "USA",
                height: "6' 2\"",
                weight: 210,
                mlbDebutDate: "2015-04-01",
                primaryNumber: "22",
                nickName: null
            }
        ])
    })

    it("stores nullable player fields", () => {
        const player: Player = {
            playerId: 123,
            firstName: "Test",
            lastName: "Player",
            fullName: "Test Player",
            primaryPosition: null,
            bats: null,
            throws: null,
            birthDate: null,
            birthCity: null,
            birthCountry: null,
            height: null,
            weight: null,
            mlbDebutDate: null,
            primaryNumber: null,
            nickName: null
        }

        repository.put(player)

        assert.deepStrictEqual(repository.get(123), player)
    })

})