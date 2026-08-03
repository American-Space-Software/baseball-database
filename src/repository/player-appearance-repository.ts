import type { Database } from "better-sqlite3"
import { PlayerAppearance } from "./interfaces.js"

class PlayerAppearanceRepository {

    public constructor(private readonly database: Database) {}

    public get(gamePk: number, playerId: number): PlayerAppearance | undefined {
        const row = this.database.prepare(`
            SELECT
                game_pk AS gamePk,
                player_id AS playerId,
                team_id AS teamId,
                appeared_as_batter AS appearedAsBatter,
                appeared_as_pitcher AS appearedAsPitcher,
                appeared_as_runner AS appearedAsRunner,
                appeared_as_fielder AS appearedAsFielder,
                started_as_batter AS startedAsBatter,
                started_as_pitcher AS startedAsPitcher,
                started_as_fielder AS startedAsFielder
            FROM player_appearances
            WHERE game_pk = ?
                AND player_id = ?
        `).get(gamePk, playerId) as {
            gamePk: number
            playerId: number
            teamId: number
            appearedAsBatter: number
            appearedAsPitcher: number
            appearedAsRunner: number
            appearedAsFielder: number
            startedAsBatter: number
            startedAsPitcher: number
            startedAsFielder: number
        } | undefined

        return row
            ? this.mapRow(row)
            : undefined
    }

    public getByGame(gamePk: number): PlayerAppearance[] {
        const rows = this.database.prepare(`
            SELECT
                game_pk AS gamePk,
                player_id AS playerId,
                team_id AS teamId,
                appeared_as_batter AS appearedAsBatter,
                appeared_as_pitcher AS appearedAsPitcher,
                appeared_as_runner AS appearedAsRunner,
                appeared_as_fielder AS appearedAsFielder,
                started_as_batter AS startedAsBatter,
                started_as_pitcher AS startedAsPitcher,
                started_as_fielder AS startedAsFielder
            FROM player_appearances
            WHERE game_pk = ?
            ORDER BY team_id, player_id
        `).all(gamePk) as {
            gamePk: number
            playerId: number
            teamId: number
            appearedAsBatter: number
            appearedAsPitcher: number
            appearedAsRunner: number
            appearedAsFielder: number
            startedAsBatter: number
            startedAsPitcher: number
            startedAsFielder: number
        }[]

        return rows.map(row => this.mapRow(row))
    }

    public getByPlayer(playerId: number): PlayerAppearance[] {
        const rows = this.database.prepare(`
            SELECT
                game_pk AS gamePk,
                player_id AS playerId,
                team_id AS teamId,
                appeared_as_batter AS appearedAsBatter,
                appeared_as_pitcher AS appearedAsPitcher,
                appeared_as_runner AS appearedAsRunner,
                appeared_as_fielder AS appearedAsFielder,
                started_as_batter AS startedAsBatter,
                started_as_pitcher AS startedAsPitcher,
                started_as_fielder AS startedAsFielder
            FROM player_appearances
            WHERE player_id = ?
            ORDER BY game_pk
        `).all(playerId) as {
            gamePk: number
            playerId: number
            teamId: number
            appearedAsBatter: number
            appearedAsPitcher: number
            appearedAsRunner: number
            appearedAsFielder: number
            startedAsBatter: number
            startedAsPitcher: number
            startedAsFielder: number
        }[]

        return rows.map(row => this.mapRow(row))
    }

    public getByDateRange(startDate: string, endDate: string): PlayerAppearance[] {
        const rows = this.database.prepare(`
            SELECT
                player_appearance.game_pk AS gamePk,
                player_appearance.player_id AS playerId,
                player_appearance.team_id AS teamId,
                player_appearance.appeared_as_batter AS appearedAsBatter,
                player_appearance.appeared_as_pitcher AS appearedAsPitcher,
                player_appearance.appeared_as_runner AS appearedAsRunner,
                player_appearance.appeared_as_fielder AS appearedAsFielder,
                player_appearance.started_as_batter AS startedAsBatter,
                player_appearance.started_as_pitcher AS startedAsPitcher,
                player_appearance.started_as_fielder AS startedAsFielder
            FROM player_appearances player_appearance
            JOIN games game
                ON game.game_pk = player_appearance.game_pk
            WHERE game.game_date >= ?
                AND game.game_date < ?
            ORDER BY
                game.game_date,
                player_appearance.game_pk,
                player_appearance.team_id,
                player_appearance.player_id
        `).all(startDate, endDate) as {
            gamePk: number
            playerId: number
            teamId: number
            appearedAsBatter: number
            appearedAsPitcher: number
            appearedAsRunner: number
            appearedAsFielder: number
            startedAsBatter: number
            startedAsPitcher: number
            startedAsFielder: number
        }[]

        return rows.map(row => this.mapRow(row))
    }

    public put(appearance: PlayerAppearance): void {
        this.database.prepare(`
            INSERT INTO player_appearances (
                game_pk,
                player_id,
                team_id,
                appeared_as_batter,
                appeared_as_pitcher,
                appeared_as_runner,
                appeared_as_fielder,
                started_as_batter,
                started_as_pitcher,
                started_as_fielder
            )
            VALUES (
                @gamePk,
                @playerId,
                @teamId,
                @appearedAsBatter,
                @appearedAsPitcher,
                @appearedAsRunner,
                @appearedAsFielder,
                @startedAsBatter,
                @startedAsPitcher,
                @startedAsFielder
            )
            ON CONFLICT(game_pk, player_id) DO UPDATE SET
                team_id = excluded.team_id,
                appeared_as_batter = excluded.appeared_as_batter,
                appeared_as_pitcher = excluded.appeared_as_pitcher,
                appeared_as_runner = excluded.appeared_as_runner,
                appeared_as_fielder = excluded.appeared_as_fielder,
                started_as_batter = excluded.started_as_batter,
                started_as_pitcher = excluded.started_as_pitcher,
                started_as_fielder = excluded.started_as_fielder
        `).run({
            gamePk: appearance.gamePk,
            playerId: appearance.playerId,
            teamId: appearance.teamId,
            appearedAsBatter: Number(appearance.appearedAsBatter),
            appearedAsPitcher: Number(appearance.appearedAsPitcher),
            appearedAsRunner: Number(appearance.appearedAsRunner),
            appearedAsFielder: Number(appearance.appearedAsFielder),
            startedAsBatter: Number(appearance.startedAsBatter),
            startedAsPitcher: Number(appearance.startedAsPitcher),
            startedAsFielder: Number(appearance.startedAsFielder)
        })
    }

    public deleteByGame(gamePk: number): void {
        this.database.prepare(`
            DELETE FROM player_appearances
            WHERE game_pk = ?
        `).run(gamePk)
    }

    private mapRow(row: {
        gamePk: number
        playerId: number
        teamId: number
        appearedAsBatter: number
        appearedAsPitcher: number
        appearedAsRunner: number
        appearedAsFielder: number
        startedAsBatter: number
        startedAsPitcher: number
        startedAsFielder: number
    }): PlayerAppearance {
        return {
            gamePk: row.gamePk,
            playerId: row.playerId,
            teamId: row.teamId,
            appearedAsBatter: Boolean(row.appearedAsBatter),
            appearedAsPitcher: Boolean(row.appearedAsPitcher),
            appearedAsRunner: Boolean(row.appearedAsRunner),
            appearedAsFielder: Boolean(row.appearedAsFielder),
            startedAsBatter: Boolean(row.startedAsBatter),
            startedAsPitcher: Boolean(row.startedAsPitcher),
            startedAsFielder: Boolean(row.startedAsFielder)
        }
    }
}


export {
    PlayerAppearanceRepository
}

