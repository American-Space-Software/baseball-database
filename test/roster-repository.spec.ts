import assert from "assert"
import Database from "better-sqlite3"

import {
    RosterRepository
} from "../src/repository/roster-repository.js"


describe("RosterRepository", () => {

    let database: Database.Database
    let repository: RosterRepository

    beforeEach(() => {
        database = new Database(":memory:")

        database.exec(`
            CREATE TABLE rosters (
                date TEXT NOT NULL,
                team_id INTEGER NOT NULL,
                player_id INTEGER NOT NULL,
                position TEXT NOT NULL,
                downloaded_at TEXT NOT NULL,

                PRIMARY KEY (
                    date,
                    team_id,
                    player_id
                )
            )
        `)

        repository = new RosterRepository(database)
    })

    afterEach(() => {
        database.close()
    })


    it("stores and gets a roster for a team and date", () => {
        repository.put(
            "2026-08-20",
            143,
            "2026-08-20T16:00:00.000Z",
            [
                {
                    playerId: 592450,
                    position: "P"
                },
                {
                    playerId: 665742,
                    position: "SS"
                }
            ]
        )

        assert.deepStrictEqual(
            repository.get(
                "2026-08-20",
                143
            ),
            [
                {
                    date: "2026-08-20",
                    teamId: 143,
                    playerId: 592450,
                    position: "P",
                    downloadedAt: "2026-08-20T16:00:00.000Z"
                },
                {
                    date: "2026-08-20",
                    teamId: 143,
                    playerId: 665742,
                    position: "SS",
                    downloadedAt: "2026-08-20T16:00:00.000Z"
                }
            ]
        )
    })


    it("returns the roster download time", () => {
        repository.put(
            "2026-08-20",
            143,
            "2026-08-20T16:00:00.000Z",
            [
                {
                    playerId: 592450,
                    position: "P"
                }
            ]
        )

        assert.strictEqual(
            repository.getDownloadedAt(
                "2026-08-20",
                143
            ),
            "2026-08-20T16:00:00.000Z"
        )
    })


    it("returns undefined when the roster has not been downloaded", () => {
        assert.strictEqual(
            repository.getDownloadedAt(
                "2026-08-20",
                143
            ),
            undefined
        )
    })


    it("replaces the existing roster for the same team and date", () => {
        repository.put(
            "2026-08-20",
            143,
            "2026-08-20T15:00:00.000Z",
            [
                {
                    playerId: 100,
                    position: "P"
                },
                {
                    playerId: 200,
                    position: "C"
                }
            ]
        )

        repository.put(
            "2026-08-20",
            143,
            "2026-08-20T16:00:00.000Z",
            [
                {
                    playerId: 300,
                    position: "1B"
                }
            ]
        )

        assert.deepStrictEqual(
            repository.get(
                "2026-08-20",
                143
            ),
            [
                {
                    date: "2026-08-20",
                    teamId: 143,
                    playerId: 300,
                    position: "1B",
                    downloadedAt: "2026-08-20T16:00:00.000Z"
                }
            ]
        )
    })


    it("keeps rosters separate by team", () => {
        repository.put(
            "2026-08-20",
            143,
            "2026-08-20T16:00:00.000Z",
            [
                {
                    playerId: 100,
                    position: "P"
                }
            ]
        )

        repository.put(
            "2026-08-20",
            134,
            "2026-08-20T16:00:00.000Z",
            [
                {
                    playerId: 200,
                    position: "C"
                }
            ]
        )

        assert.strictEqual(
            repository.get(
                "2026-08-20",
                143
            )[0].playerId,
            100
        )

        assert.strictEqual(
            repository.get(
                "2026-08-20",
                134
            )[0].playerId,
            200
        )
    })


    it("keeps rosters separate by date", () => {
        repository.put(
            "2026-08-19",
            143,
            "2026-08-19T16:00:00.000Z",
            [
                {
                    playerId: 100,
                    position: "P"
                }
            ]
        )

        repository.put(
            "2026-08-20",
            143,
            "2026-08-20T16:00:00.000Z",
            [
                {
                    playerId: 200,
                    position: "C"
                }
            ]
        )

        assert.strictEqual(
            repository.get(
                "2026-08-19",
                143
            )[0].playerId,
            100
        )

        assert.strictEqual(
            repository.get(
                "2026-08-20",
                143
            )[0].playerId,
            200
        )
    })


    it("returns an empty roster when no rows exist", () => {
        assert.deepStrictEqual(
            repository.get(
                "2026-08-20",
                143
            ),
            []
        )
    })


    it("returns roster players ordered by player id", () => {
        repository.put(
            "2026-08-20",
            143,
            "2026-08-20T16:00:00.000Z",
            [
                {
                    playerId: 300,
                    position: "3B"
                },
                {
                    playerId: 100,
                    position: "P"
                },
                {
                    playerId: 200,
                    position: "C"
                }
            ]
        )

        assert.deepStrictEqual(
            repository.get(
                "2026-08-20",
                143
            ).map(roster => roster.playerId),
            [
                100,
                200,
                300
            ]
        )
    })

})