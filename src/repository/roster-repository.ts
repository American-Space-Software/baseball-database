import type { Database } from "better-sqlite3"


class RosterRepository {

    public constructor(private readonly database: Database) {}

    public get(date: string, teamId: number): Roster[] {
        return this.database.prepare(`
            SELECT
                date,
                team_id AS teamId,
                player_id AS playerId,
                position,
                downloaded_at AS downloadedAt
            FROM rosters
            WHERE date = ?
              AND team_id = ?
            ORDER BY player_id
        `).all(
            date,
            teamId
        ) as Roster[]
    }

    public getDownloadedAt(date: string, teamId: number): string | undefined {
        const row = this.database.prepare(`
            SELECT downloaded_at AS downloadedAt
            FROM rosters
            WHERE date = ?
              AND team_id = ?
            LIMIT 1
        `).get(
            date,
            teamId
        ) as {
            downloadedAt: string
        } | undefined

        return row?.downloadedAt
    }

    public put(date: string, teamId: number, downloadedAt: string, rosters: { playerId: number, position: string }[]): void {
        const deleteStatement = this.database.prepare(`
            DELETE FROM rosters
            WHERE date = ?
              AND team_id = ?
        `)

        const insertStatement = this.database.prepare(`
            INSERT INTO rosters (
                date,
                team_id,
                player_id,
                position,
                downloaded_at
            )
            VALUES (
                @date,
                @teamId,
                @playerId,
                @position,
                @downloadedAt
            )
        `)

        const transaction = this.database.transaction(() => {
            deleteStatement.run(
                date,
                teamId
            )

            for (const roster of rosters) {
                insertStatement.run({
                    date,
                    teamId,
                    playerId: roster.playerId,
                    position: roster.position,
                    downloadedAt
                })
            }
        })

        transaction()
    }

}


interface Roster {
    date: string
    teamId: number
    playerId: number
    position: string
    downloadedAt: string
}


export {
    RosterRepository
}

export type {
    Roster
}