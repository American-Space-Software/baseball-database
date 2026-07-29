import type { Database } from "better-sqlite3"

class DefensiveEventRepository {

    public constructor(private readonly database: Database) {}

    public get(gamePk: number, atBatIndex: number, eventIndex: number, playerId: number): DefensiveEvent | undefined {
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
        `).get(gamePk, atBatIndex, eventIndex, playerId) as DefensiveEvent | undefined

        return row
    }

    public getByGame(gamePk: number): DefensiveEvent[] {
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
        `).all(gamePk) as DefensiveEvent[]
    }

    public getByDateRange(startDate: string, endDate: string): DefensiveEvent[] {
        return this.database.prepare(`
            SELECT
                defensive_event.game_pk AS gamePk,
                defensive_event.at_bat_index AS atBatIndex,
                defensive_event.event_index AS eventIndex,
                defensive_event.team_id AS teamId,
                defensive_event.player_id AS playerId,
                defensive_event.event_type AS eventType,
                defensive_event.from_position AS fromPosition,
                defensive_event.to_position AS toPosition
            FROM defensive_events defensive_event
            JOIN games game
                ON game.game_pk = defensive_event.game_pk
            WHERE game.game_date >= ?
                AND game.game_date < ?
            ORDER BY
                game.game_date,
                defensive_event.game_pk,
                defensive_event.at_bat_index,
                defensive_event.event_index,
                defensive_event.player_id
        `).all(startDate, endDate) as DefensiveEvent[]
    }

    public put(defensiveEvent: DefensiveEvent): void {
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
        `).run(defensiveEvent)
    }

    public deleteByGame(gamePk: number): void {
        this.database.prepare(`
            DELETE FROM defensive_events
            WHERE game_pk = ?
        `).run(gamePk)
    }
}

interface DefensiveEvent {
    gamePk: number
    atBatIndex: number
    eventIndex: number
    teamId: number
    playerId: number
    eventType: "starting_assignment" | "defensive_substitution" | "position_switch" | "pitching_change" | "removal"
    fromPosition: "P" | "C" | "1B" | "2B" | "3B" | "SS" | "LF" | "CF" | "RF" | "DH" | null
    toPosition: "P" | "C" | "1B" | "2B" | "3B" | "SS" | "LF" | "CF" | "RF" | "DH" | null
}

export {
    DefensiveEventRepository
}

export type {
    DefensiveEvent
}