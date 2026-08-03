import type { Database } from "better-sqlite3"
import { PlateAppearance } from "./interfaces.js"

class PlateAppearanceRepository {

    public constructor(private readonly database: Database) {}

    public get(gamePk: number, atBatIndex: number): PlateAppearance | undefined {
        const row = this.database.prepare(`
            SELECT
                game_pk AS gamePk,
                at_bat_index AS atBatIndex,
                inning,
                half_inning AS halfInning,
                is_top_inning AS isTopInning,
                batter_id AS batterId,
                pitcher_id AS pitcherId,
                bat_side_code AS batSideCode,
                pitch_hand_code AS pitchHandCode,
                result_type AS resultType,
                event,
                event_type AS eventType,
                description,
                rbi,
                away_score AS awayScore,
                home_score AS homeScore,
                balls,
                strikes,
                outs,
                start_time AS startTime,
                end_time AS endTime,
                is_complete AS isComplete
            FROM plate_appearances
            WHERE game_pk = ?
                AND at_bat_index = ?
        `).get(gamePk, atBatIndex) as {
            gamePk: number
            atBatIndex: number
            inning: number
            halfInning: string
            isTopInning: number
            batterId: number
            pitcherId: number
            batSideCode: string | null
            pitchHandCode: string | null
            resultType: string | null
            event: string | null
            eventType: string | null
            description: string | null
            rbi: number
            awayScore: number
            homeScore: number
            balls: number
            strikes: number
            outs: number
            startTime: string | null
            endTime: string | null
            isComplete: number
        } | undefined

        return row
            ? this.mapRow(row)
            : undefined
    }

    public getByGame(gamePk: number): PlateAppearance[] {
        const rows = this.database.prepare(`
            SELECT
                game_pk AS gamePk,
                at_bat_index AS atBatIndex,
                inning,
                half_inning AS halfInning,
                is_top_inning AS isTopInning,
                batter_id AS batterId,
                pitcher_id AS pitcherId,
                bat_side_code AS batSideCode,
                pitch_hand_code AS pitchHandCode,
                result_type AS resultType,
                event,
                event_type AS eventType,
                description,
                rbi,
                away_score AS awayScore,
                home_score AS homeScore,
                balls,
                strikes,
                outs,
                start_time AS startTime,
                end_time AS endTime,
                is_complete AS isComplete
            FROM plate_appearances
            WHERE game_pk = ?
            ORDER BY at_bat_index
        `).all(gamePk) as {
            gamePk: number
            atBatIndex: number
            inning: number
            halfInning: string
            isTopInning: number
            batterId: number
            pitcherId: number
            batSideCode: string | null
            pitchHandCode: string | null
            resultType: string | null
            event: string | null
            eventType: string | null
            description: string | null
            rbi: number
            awayScore: number
            homeScore: number
            balls: number
            strikes: number
            outs: number
            startTime: string | null
            endTime: string | null
            isComplete: number
        }[]

        return rows.map(row => this.mapRow(row))
    }

    public getByBatter(playerId: number): PlateAppearance[] {
        const rows = this.database.prepare(`
            SELECT
                game_pk AS gamePk,
                at_bat_index AS atBatIndex,
                inning,
                half_inning AS halfInning,
                is_top_inning AS isTopInning,
                batter_id AS batterId,
                pitcher_id AS pitcherId,
                bat_side_code AS batSideCode,
                pitch_hand_code AS pitchHandCode,
                result_type AS resultType,
                event,
                event_type AS eventType,
                description,
                rbi,
                away_score AS awayScore,
                home_score AS homeScore,
                balls,
                strikes,
                outs,
                start_time AS startTime,
                end_time AS endTime,
                is_complete AS isComplete
            FROM plate_appearances
            WHERE batter_id = ?
            ORDER BY game_pk, at_bat_index
        `).all(playerId) as {
            gamePk: number
            atBatIndex: number
            inning: number
            halfInning: string
            isTopInning: number
            batterId: number
            pitcherId: number
            batSideCode: string | null
            pitchHandCode: string | null
            resultType: string | null
            event: string | null
            eventType: string | null
            description: string | null
            rbi: number
            awayScore: number
            homeScore: number
            balls: number
            strikes: number
            outs: number
            startTime: string | null
            endTime: string | null
            isComplete: number
        }[]

        return rows.map(row => this.mapRow(row))
    }

    public getByPitcher(playerId: number): PlateAppearance[] {
        const rows = this.database.prepare(`
            SELECT
                game_pk AS gamePk,
                at_bat_index AS atBatIndex,
                inning,
                half_inning AS halfInning,
                is_top_inning AS isTopInning,
                batter_id AS batterId,
                pitcher_id AS pitcherId,
                bat_side_code AS batSideCode,
                pitch_hand_code AS pitchHandCode,
                result_type AS resultType,
                event,
                event_type AS eventType,
                description,
                rbi,
                away_score AS awayScore,
                home_score AS homeScore,
                balls,
                strikes,
                outs,
                start_time AS startTime,
                end_time AS endTime,
                is_complete AS isComplete
            FROM plate_appearances
            WHERE pitcher_id = ?
            ORDER BY game_pk, at_bat_index
        `).all(playerId) as {
            gamePk: number
            atBatIndex: number
            inning: number
            halfInning: string
            isTopInning: number
            batterId: number
            pitcherId: number
            batSideCode: string | null
            pitchHandCode: string | null
            resultType: string | null
            event: string | null
            eventType: string | null
            description: string | null
            rbi: number
            awayScore: number
            homeScore: number
            balls: number
            strikes: number
            outs: number
            startTime: string | null
            endTime: string | null
            isComplete: number
        }[]

        return rows.map(row => this.mapRow(row))
    }

    public getByDateRange(startDate: string, endDate: string): PlateAppearance[] {
        const rows = this.database.prepare(`
            SELECT
                plate_appearance.game_pk AS gamePk,
                plate_appearance.at_bat_index AS atBatIndex,
                plate_appearance.inning,
                plate_appearance.half_inning AS halfInning,
                plate_appearance.is_top_inning AS isTopInning,
                plate_appearance.batter_id AS batterId,
                plate_appearance.pitcher_id AS pitcherId,
                plate_appearance.bat_side_code AS batSideCode,
                plate_appearance.pitch_hand_code AS pitchHandCode,
                plate_appearance.result_type AS resultType,
                plate_appearance.event,
                plate_appearance.event_type AS eventType,
                plate_appearance.description,
                plate_appearance.rbi,
                plate_appearance.away_score AS awayScore,
                plate_appearance.home_score AS homeScore,
                plate_appearance.balls,
                plate_appearance.strikes,
                plate_appearance.outs,
                plate_appearance.start_time AS startTime,
                plate_appearance.end_time AS endTime,
                plate_appearance.is_complete AS isComplete
            FROM plate_appearances plate_appearance
            JOIN games game
                ON game.game_pk = plate_appearance.game_pk
            WHERE game.game_date >= ?
                AND game.game_date < ?
            ORDER BY
                game.game_date,
                plate_appearance.game_pk,
                plate_appearance.at_bat_index
        `).all(startDate, endDate) as {
            gamePk: number
            atBatIndex: number
            inning: number
            halfInning: string
            isTopInning: number
            batterId: number
            pitcherId: number
            batSideCode: string | null
            pitchHandCode: string | null
            resultType: string | null
            event: string | null
            eventType: string | null
            description: string | null
            rbi: number
            awayScore: number
            homeScore: number
            balls: number
            strikes: number
            outs: number
            startTime: string | null
            endTime: string | null
            isComplete: number
        }[]

        return rows.map(row => this.mapRow(row))
    }

    public put(plateAppearance: PlateAppearance): void {
        this.database.prepare(`
            INSERT INTO plate_appearances (
                game_pk,
                at_bat_index,
                inning,
                half_inning,
                is_top_inning,
                batter_id,
                pitcher_id,
                bat_side_code,
                pitch_hand_code,
                result_type,
                event,
                event_type,
                description,
                rbi,
                away_score,
                home_score,
                balls,
                strikes,
                outs,
                start_time,
                end_time,
                is_complete
            )
            VALUES (
                @gamePk,
                @atBatIndex,
                @inning,
                @halfInning,
                @isTopInning,
                @batterId,
                @pitcherId,
                @batSideCode,
                @pitchHandCode,
                @resultType,
                @event,
                @eventType,
                @description,
                @rbi,
                @awayScore,
                @homeScore,
                @balls,
                @strikes,
                @outs,
                @startTime,
                @endTime,
                @isComplete
            )
            ON CONFLICT(game_pk, at_bat_index) DO UPDATE SET
                inning = excluded.inning,
                half_inning = excluded.half_inning,
                is_top_inning = excluded.is_top_inning,
                batter_id = excluded.batter_id,
                pitcher_id = excluded.pitcher_id,
                bat_side_code = excluded.bat_side_code,
                pitch_hand_code = excluded.pitch_hand_code,
                result_type = excluded.result_type,
                event = excluded.event,
                event_type = excluded.event_type,
                description = excluded.description,
                rbi = excluded.rbi,
                away_score = excluded.away_score,
                home_score = excluded.home_score,
                balls = excluded.balls,
                strikes = excluded.strikes,
                outs = excluded.outs,
                start_time = excluded.start_time,
                end_time = excluded.end_time,
                is_complete = excluded.is_complete
        `).run({
            ...plateAppearance,
            isTopInning: Number(plateAppearance.isTopInning),
            isComplete: Number(plateAppearance.isComplete)
        })
    }

    public deleteByGame(gamePk: number): void {
        this.database.prepare(`
            DELETE FROM plate_appearances
            WHERE game_pk = ?
        `).run(gamePk)
    }

    private mapRow(row: {
        gamePk: number
        atBatIndex: number
        inning: number
        halfInning: string
        isTopInning: number
        batterId: number
        pitcherId: number
        batSideCode: string | null
        pitchHandCode: string | null
        resultType: string | null
        event: string | null
        eventType: string | null
        description: string | null
        rbi: number
        awayScore: number
        homeScore: number
        balls: number
        strikes: number
        outs: number
        startTime: string | null
        endTime: string | null
        isComplete: number
    }): PlateAppearance {
        return {
            gamePk: row.gamePk,
            atBatIndex: row.atBatIndex,
            inning: row.inning,
            halfInning: row.halfInning,
            isTopInning: Boolean(row.isTopInning),
            batterId: row.batterId,
            pitcherId: row.pitcherId,
            batSideCode: row.batSideCode,
            pitchHandCode: row.pitchHandCode,
            resultType: row.resultType,
            event: row.event,
            eventType: row.eventType,
            description: row.description,
            rbi: row.rbi,
            awayScore: row.awayScore,
            homeScore: row.homeScore,
            balls: row.balls,
            strikes: row.strikes,
            outs: row.outs,
            startTime: row.startTime,
            endTime: row.endTime,
            isComplete: Boolean(row.isComplete)
        }
    }
}


export {
    PlateAppearanceRepository
}

