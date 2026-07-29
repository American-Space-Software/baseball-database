class PlayerAppearanceRepository {
    database;
    constructor(database) {
        this.database = database;
    }
    get(gamePk, playerId) {
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
        `).get(gamePk, playerId);
        return row
            ? this.mapRow(row)
            : undefined;
    }
    getByGame(gamePk) {
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
        `).all(gamePk);
        return rows.map(row => this.mapRow(row));
    }
    getByPlayer(playerId) {
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
        `).all(playerId);
        return rows.map(row => this.mapRow(row));
    }
    put(appearance) {
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
        });
    }
    deleteByGame(gamePk) {
        this.database.prepare(`
            DELETE FROM player_appearances
            WHERE game_pk = ?
        `).run(gamePk);
    }
    mapRow(row) {
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
        };
    }
}
export { PlayerAppearanceRepository };
//# sourceMappingURL=player-appearance-repository.js.map