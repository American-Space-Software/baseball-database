import type { Database } from "better-sqlite3"
import type { GameFeedResponse } from "mlb-stats-api"

class GameRepository {

    public constructor(private readonly database: Database) {}

    public get(gamePk: number): Game | undefined {
        const row = this.database.prepare(`
            SELECT game_pk, data
            FROM games
            WHERE game_pk = ?
        `).get(gamePk) as {
            game_pk: number
            data: string
        } | undefined

        if (!row) {
            return undefined
        }

        return {
            gamePk: row.game_pk,
            data: JSON.parse(row.data) as GameFeedResponse
        }
    }

    public put(game: Game): void {
        this.database.prepare(`
            INSERT INTO games (
                game_pk,
                data
            )
            VALUES (
                @gamePk,
                @data
            )
            ON CONFLICT(game_pk) DO UPDATE SET
                data = excluded.data
        `).run({
            gamePk: game.gamePk,
            data: JSON.stringify(game.data)
        })
    }
}

interface Game {
    gamePk: number
    data: GameFeedResponse
}

export {
    GameRepository
}

export type {
    Game
}