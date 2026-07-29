class FieldingCreditRepository {
    database;
    constructor(database) {
        this.database = database;
    }
    get(gamePk, atBatIndex, runnerIndex, creditIndex) {
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
        `).get(gamePk, atBatIndex, runnerIndex, creditIndex);
        return row
            ? this.mapRow(row)
            : undefined;
    }
    getByRunnerMovement(gamePk, atBatIndex, runnerIndex) {
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
        `).all(gamePk, atBatIndex, runnerIndex);
        return rows.map(row => this.mapRow(row));
    }
    getByPlateAppearance(gamePk, atBatIndex) {
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
        `).all(gamePk, atBatIndex);
        return rows.map(row => this.mapRow(row));
    }
    getByGame(gamePk) {
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
        `).all(gamePk);
        return rows.map(row => this.mapRow(row));
    }
    getByPlayer(playerId) {
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
        `).all(playerId);
        return rows.map(row => this.mapRow(row));
    }
    put(fieldingCredit) {
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
        `).run(fieldingCredit);
    }
    deleteByGame(gamePk) {
        this.database.prepare(`
            DELETE FROM fielding_credits
            WHERE game_pk = ?
        `).run(gamePk);
    }
    mapRow(row) {
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
        };
    }
}
export { FieldingCreditRepository };
//# sourceMappingURL=fielding-credit-repository.js.map