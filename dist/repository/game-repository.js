class GameRepository {
    database;
    constructor(database) {
        this.database = database;
    }
    get(gamePk) {
        const row = this.database.prepare(`
            SELECT game_pk, data
            FROM games
            WHERE game_pk = ?
        `).get(gamePk);
        if (!row) {
            return undefined;
        }
        return {
            gamePk: row.game_pk,
            data: JSON.parse(row.data)
        };
    }
    put(game) {
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
        });
    }
}
export { GameRepository };
//# sourceMappingURL=game-repository.js.map