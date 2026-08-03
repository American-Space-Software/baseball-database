import type { Database } from "better-sqlite3"
import { FieldingCredit, FieldingCreditRow } from "./interfaces.js"

class FieldingCreditRepository {

    public constructor(private readonly database: Database) {}

    public get(gamePk: number, atBatIndex: number, runnerIndex: number, creditIndex: number): FieldingCredit | undefined {
        const row = this.database.prepare(`
            SELECT
                game_pk AS gamePk,
                at_bat_index AS atBatIndex,
                runner_index AS runnerIndex,
                credit_index AS creditIndex,
                player_id AS playerId,
                credit,
                position_code AS positionCode,
                position_name AS positionName,
                position_type AS positionType,
                position_abbreviation AS positionAbbreviation
            FROM fielding_credits
            WHERE game_pk = ?
                AND at_bat_index = ?
                AND runner_index = ?
                AND credit_index = ?
        `).get(gamePk, atBatIndex, runnerIndex, creditIndex) as FieldingCreditRow | undefined

        return row
            ? this.mapRow(row)
            : undefined
    }

    public getByRunnerMovement(gamePk: number, atBatIndex: number, runnerIndex: number): FieldingCredit[] {
        const rows = this.database.prepare(`
            SELECT
                game_pk AS gamePk,
                at_bat_index AS atBatIndex,
                runner_index AS runnerIndex,
                credit_index AS creditIndex,
                player_id AS playerId,
                credit,
                position_code AS positionCode,
                position_name AS positionName,
                position_type AS positionType,
                position_abbreviation AS positionAbbreviation
            FROM fielding_credits
            WHERE game_pk = ?
                AND at_bat_index = ?
                AND runner_index = ?
            ORDER BY credit_index
        `).all(gamePk, atBatIndex, runnerIndex) as FieldingCreditRow[]

        return rows.map(row => this.mapRow(row))
    }

    public getByPlateAppearance(gamePk: number, atBatIndex: number): FieldingCredit[] {
        const rows = this.database.prepare(`
            SELECT
                game_pk AS gamePk,
                at_bat_index AS atBatIndex,
                runner_index AS runnerIndex,
                credit_index AS creditIndex,
                player_id AS playerId,
                credit,
                position_code AS positionCode,
                position_name AS positionName,
                position_type AS positionType,
                position_abbreviation AS positionAbbreviation
            FROM fielding_credits
            WHERE game_pk = ?
                AND at_bat_index = ?
            ORDER BY runner_index, credit_index
        `).all(gamePk, atBatIndex) as FieldingCreditRow[]

        return rows.map(row => this.mapRow(row))
    }

    public getByGame(gamePk: number): FieldingCredit[] {
        const rows = this.database.prepare(`
            SELECT
                game_pk AS gamePk,
                at_bat_index AS atBatIndex,
                runner_index AS runnerIndex,
                credit_index AS creditIndex,
                player_id AS playerId,
                credit,
                position_code AS positionCode,
                position_name AS positionName,
                position_type AS positionType,
                position_abbreviation AS positionAbbreviation
            FROM fielding_credits
            WHERE game_pk = ?
            ORDER BY at_bat_index, runner_index, credit_index
        `).all(gamePk) as FieldingCreditRow[]

        return rows.map(row => this.mapRow(row))
    }

    public getByPlayer(playerId: number): FieldingCredit[] {
        const rows = this.database.prepare(`
            SELECT
                game_pk AS gamePk,
                at_bat_index AS atBatIndex,
                runner_index AS runnerIndex,
                credit_index AS creditIndex,
                player_id AS playerId,
                credit,
                position_code AS positionCode,
                position_name AS positionName,
                position_type AS positionType,
                position_abbreviation AS positionAbbreviation
            FROM fielding_credits
            WHERE player_id = ?
            ORDER BY game_pk, at_bat_index, runner_index, credit_index
        `).all(playerId) as FieldingCreditRow[]

        return rows.map(row => this.mapRow(row))
    }

    public getByDateRange(startDate: string, endDate: string): FieldingCredit[] {
        const rows = this.database.prepare(`
            SELECT
                fielding_credit.game_pk AS gamePk,
                fielding_credit.at_bat_index AS atBatIndex,
                fielding_credit.runner_index AS runnerIndex,
                fielding_credit.credit_index AS creditIndex,
                fielding_credit.player_id AS playerId,
                fielding_credit.credit,
                fielding_credit.position_code AS positionCode,
                fielding_credit.position_name AS positionName,
                fielding_credit.position_type AS positionType,
                fielding_credit.position_abbreviation AS positionAbbreviation
            FROM fielding_credits fielding_credit
            JOIN games game
                ON game.game_pk = fielding_credit.game_pk
            WHERE game.game_date >= ?
                AND game.game_date < ?
            ORDER BY
                game.game_date,
                fielding_credit.game_pk,
                fielding_credit.at_bat_index,
                fielding_credit.runner_index,
                fielding_credit.credit_index
        `).all(startDate, endDate) as FieldingCreditRow[]

        return rows.map(row => this.mapRow(row))
    }

    public put(fieldingCredit: FieldingCredit): void {
        this.database.prepare(`
            INSERT INTO fielding_credits (
                game_pk,
                at_bat_index,
                runner_index,
                credit_index,
                player_id,
                credit,
                position_code,
                position_name,
                position_type,
                position_abbreviation
            )
            VALUES (
                @gamePk,
                @atBatIndex,
                @runnerIndex,
                @creditIndex,
                @playerId,
                @credit,
                @positionCode,
                @positionName,
                @positionType,
                @positionAbbreviation
            )
            ON CONFLICT(game_pk, at_bat_index, runner_index, credit_index) DO UPDATE SET
                player_id = excluded.player_id,
                credit = excluded.credit,
                position_code = excluded.position_code,
                position_name = excluded.position_name,
                position_type = excluded.position_type,
                position_abbreviation = excluded.position_abbreviation
        `).run(fieldingCredit)
    }

    public deleteByGame(gamePk: number): void {
        this.database.prepare(`
            DELETE FROM fielding_credits
            WHERE game_pk = ?
        `).run(gamePk)
    }

    private mapRow(row: FieldingCreditRow): FieldingCredit {
        return {
            gamePk: row.gamePk,
            atBatIndex: row.atBatIndex,
            runnerIndex: row.runnerIndex,
            creditIndex: row.creditIndex,
            playerId: row.playerId,
            credit: row.credit,
            positionCode: row.positionCode,
            positionName: row.positionName,
            positionType: row.positionType,
            positionAbbreviation: row.positionAbbreviation
        }
    }
}


export {
    FieldingCreditRepository
}

export type {
    FieldingCredit
}