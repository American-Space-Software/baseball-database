class GameRepository {
    database;
    constructor(database) {
        this.database = database;
    }
    get(gamePk) {
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
        `).get(gamePk);
        return row
            ? this.mapRow(row)
            : undefined;
    }
    getByPks(gamePks) {
        if (gamePks.length === 0) {
            return [];
        }
        const placeholders = gamePks
            .map(() => "?")
            .join(", ");
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
        `).all(...gamePks);
        return rows.map(row => this.mapRow(row));
    }
    getByDateRange(startDate, endDate) {
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
        `).all(startDate, endDate);
        return rows.map(row => this.mapRow(row));
    }
    getCompletedByDate(date) {
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
        `).all(date);
        return rows.map(row => this.mapRow(row));
    }
    getCompletedByDateRange(startDate, endDate) {
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
        `).all(startDate, endDate);
        return rows.map(row => this.mapRow(row));
    }
    getCompletedGamePksByDate(date) {
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
        `).all(date);
        return rows.map(row => row.gamePk);
    }
    getCompletedGamePksByDateRange(startDate, endDate) {
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
        `).all(startDate, endDate);
        return rows.map(row => row.gamePk);
    }
    put(game) {
        this.database.prepare(`
            INSERT INTO games (
                game_pk,
                data,
                game_type
            )
            VALUES (
                @gamePk,
                @data,
                @gameType
            )
            ON CONFLICT(game_pk) DO UPDATE SET
                data = excluded.data,
                game_type = excluded.game_type
        `).run({
            gamePk: game.gamePk,
            data: JSON.stringify(game.data),
            gameType: game.data.gameData.game.type
        });
    }
    getGameDatesByDateRange(startDate, endDate) {
        return this.database.prepare(`
            SELECT
                game_pk AS gamePk,
                game_date AS gameDate
            FROM games
            WHERE game_date >= ?
            AND game_date < ?
            ORDER BY game_date, game_pk
        `).all(startDate, endDate);
    }
    mapRow(row) {
        return {
            gamePk: row.gamePk,
            data: JSON.parse(row.data),
            gameDate: row.gameDate,
            abstractGameState: row.abstractGameState,
            codedGameState: row.codedGameState,
            detailedState: row.detailedState,
            statusCode: row.statusCode
        };
    }
}
export { GameRepository };
//# sourceMappingURL=game-repository.js.map