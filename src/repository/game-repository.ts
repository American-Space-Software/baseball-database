import type { Database } from "better-sqlite3"
import type { GameFeedResponse } from "mlb-stats-api"
import { Game, GameDate, GameRow } from "./interfaces.js"

class GameRepository {

    public constructor(private readonly database: Database) {}

    public get(gamePk: number): Game | undefined {
        const row = this.database.prepare(`
            SELECT
                game_pk AS gamePk,
                data,
                game_date AS gameDate,
                abstract_game_state AS abstractGameState,
                coded_game_state AS codedGameState,
                detailed_state AS detailedState,
                status_code AS statusCode
            FROM games
            WHERE game_pk = ?
        `).get(gamePk) as GameRow | undefined

        return row
            ? this.mapRow(row)
            : undefined
    }

    public getByPks(gamePks: number[]): Game[] {
        if (gamePks.length === 0) {
            return []
        }

        const placeholders = gamePks
            .map(() => "?")
            .join(", ")

        const rows = this.database.prepare(`
            SELECT
                game_pk AS gamePk,
                data,
                game_date AS gameDate,
                abstract_game_state AS abstractGameState,
                coded_game_state AS codedGameState,
                detailed_state AS detailedState,
                status_code AS statusCode
            FROM games
            WHERE game_pk IN (${placeholders})
            ORDER BY game_pk
        `).all(...gamePks) as GameRow[]

        return rows.map(row => this.mapRow(row))
    }

    public getByDateRange(startDate: string, endDate: string): Game[] {
        const rows = this.database.prepare(`
            SELECT
                game_pk AS gamePk,
                data,
                game_date AS gameDate,
                abstract_game_state AS abstractGameState,
                coded_game_state AS codedGameState,
                detailed_state AS detailedState,
                status_code AS statusCode
            FROM games
            WHERE game_date >= ?
                AND game_date < ?
            ORDER BY game_date, game_pk
        `).all(startDate, endDate) as GameRow[]

        return rows.map(row => this.mapRow(row))
    }

    public getCompletedByDate(date: string): Game[] {
        const rows = this.database.prepare(`
            SELECT
                game_pk AS gamePk,
                data,
                game_date AS gameDate,
                abstract_game_state AS abstractGameState,
                coded_game_state AS codedGameState,
                detailed_state AS detailedState,
                status_code AS statusCode
            FROM games
            WHERE game_date = ?
                AND abstract_game_state = 'Final'
                AND detailed_state NOT IN (
                    'Postponed',
                    'Cancelled',
                    'Suspended'
                )
                AND coded_game_state <> 'D'
                AND status_code <> 'DR'
            ORDER BY game_pk
        `).all(date) as GameRow[]

        return rows.map(row => this.mapRow(row))
    }

    public getCompletedByDateRange(startDate: string, endDate: string): Game[] {
        const rows = this.database.prepare(`
            SELECT
                game_pk AS gamePk,
                data,
                game_date AS gameDate,
                abstract_game_state AS abstractGameState,
                coded_game_state AS codedGameState,
                detailed_state AS detailedState,
                status_code AS statusCode
            FROM games
            WHERE game_date >= ?
                AND game_date < ?
                AND abstract_game_state = 'Final'
                AND detailed_state NOT IN (
                    'Postponed',
                    'Cancelled',
                    'Suspended'
                )
                AND coded_game_state <> 'D'
                AND status_code <> 'DR'
            ORDER BY game_date, game_pk
        `).all(startDate, endDate) as GameRow[]

        return rows.map(row => this.mapRow(row))
    }

    public getCompletedGamePksByDate(date: string): number[] {
        const rows = this.database.prepare(`
            SELECT
                game_pk AS gamePk
            FROM games
            WHERE game_date = ?
                AND abstract_game_state = 'Final'
                AND detailed_state NOT IN (
                    'Postponed',
                    'Cancelled',
                    'Suspended'
                )
                AND coded_game_state <> 'D'
                AND status_code <> 'DR'
            ORDER BY game_pk
        `).all(date) as { gamePk: number }[]

        return rows.map(row => row.gamePk)
    }

    public getCompletedGamePksByDateRange(startDate: string, endDate: string): number[] {
        const rows = this.database.prepare(`
            SELECT
                game_pk AS gamePk
            FROM games
            WHERE game_date >= ?
                AND game_date < ?
                AND abstract_game_state = 'Final'
                AND detailed_state NOT IN (
                    'Postponed',
                    'Cancelled',
                    'Suspended'
                )
                AND coded_game_state <> 'D'
                AND status_code <> 'DR'
            ORDER BY game_date, game_pk
        `).all(startDate, endDate) as { gamePk: number }[]

        return rows.map(row => row.gamePk)
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

    public getGameDatesByDateRange(startDate: string, endDate: string): GameDate[] {
        return this.database.prepare(`
            SELECT
                game_pk AS gamePk,
                game_date AS gameDate
            FROM games
            WHERE game_date >= ?
            AND game_date < ?
            ORDER BY game_date, game_pk
        `).all(startDate, endDate) as GameDate[]
    }


    private mapRow(row: GameRow): Game {
        return {
            gamePk: row.gamePk,
            data: JSON.parse(row.data) as GameFeedResponse,
            gameDate: row.gameDate,
            abstractGameState: row.abstractGameState,
            codedGameState: row.codedGameState,
            detailedState: row.detailedState,
            statusCode: row.statusCode
        }
    }
}


export {
    GameRepository
}

