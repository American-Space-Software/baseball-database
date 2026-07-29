class DefensiveEventRepository {
    database;
    constructor(database) {
        this.database = database;
    }
    get(gamePk, atBatIndex, eventIndex, playerId) {
        const row = this.database.prepare(`
            SELECT
                game_pk AS gamePk,
                at_bat_index AS atBatIndex,
                event_index AS eventIndex,
                team_id AS teamId,
                player_id AS playerId,
                event_type AS eventType,
                from_position AS fromPosition,
                to_position AS toPosition
            FROM defensive_events
            WHERE game_pk = ?
                AND at_bat_index = ?
                AND event_index = ?
                AND player_id = ?
        `).get(gamePk, atBatIndex, eventIndex, playerId);
        return row;
    }
    getByGame(gamePk) {
        return this.database.prepare(`
            SELECT
                game_pk AS gamePk,
                at_bat_index AS atBatIndex,
                event_index AS eventIndex,
                team_id AS teamId,
                player_id AS playerId,
                event_type AS eventType,
                from_position AS fromPosition,
                to_position AS toPosition
            FROM defensive_events
            WHERE game_pk = ?
            ORDER BY
                at_bat_index,
                event_index,
                player_id
        `).all(gamePk);
    }
    put(defensiveEvent) {
        this.database.prepare(`
            INSERT INTO defensive_events (
                game_pk,
                at_bat_index,
                event_index,
                team_id,
                player_id,
                event_type,
                from_position,
                to_position
            )
            VALUES (
                @gamePk,
                @atBatIndex,
                @eventIndex,
                @teamId,
                @playerId,
                @eventType,
                @fromPosition,
                @toPosition
            )
            ON CONFLICT(game_pk, at_bat_index, event_index, player_id) DO UPDATE SET
                team_id = excluded.team_id,
                event_type = excluded.event_type,
                from_position = excluded.from_position,
                to_position = excluded.to_position
        `).run(defensiveEvent);
    }
    deleteByGame(gamePk) {
        this.database.prepare(`
            DELETE FROM defensive_events
            WHERE game_pk = ?
        `).run(gamePk);
    }
}
export { DefensiveEventRepository };
//# sourceMappingURL=defensive-event-repository.js.map