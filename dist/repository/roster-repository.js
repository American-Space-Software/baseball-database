class RosterRepository {
    database;
    constructor(database) {
        this.database = database;
    }
    get(date, teamId) {
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
        `).all(date, teamId);
    }
    getDownloadedAt(date, teamId) {
        const row = this.database.prepare(`
            SELECT downloaded_at AS downloadedAt
            FROM rosters
            WHERE date = ?
              AND team_id = ?
            LIMIT 1
        `).get(date, teamId);
        return row?.downloadedAt;
    }
    put(date, teamId, downloadedAt, rosters) {
        const deleteStatement = this.database.prepare(`
            DELETE FROM rosters
            WHERE date = ?
              AND team_id = ?
        `);
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
        `);
        const transaction = this.database.transaction(() => {
            deleteStatement.run(date, teamId);
            for (const roster of rosters) {
                insertStatement.run({
                    date,
                    teamId,
                    playerId: roster.playerId,
                    position: roster.position,
                    downloadedAt
                });
            }
        });
        transaction();
    }
}
export { RosterRepository };
//# sourceMappingURL=roster-repository.js.map