import type { Database } from "better-sqlite3"
import { RunnerMovement } from "./interfaces.js"

class RunnerMovementRepository {

    public constructor(private readonly database: Database) {}

    public get(gamePk: number, atBatIndex: number, runnerIndex: number): RunnerMovement | undefined {
        const row = this.database.prepare(`
            SELECT
                game_pk AS gamePk,
                at_bat_index AS atBatIndex,
                runner_index AS runnerIndex,
                play_index AS playIndex,

                runner_id AS runnerId,
                responsible_pitcher_id AS responsiblePitcherId,

                event,
                event_type AS eventType,
                movement_reason AS movementReason,

                origin_base AS originBase,
                start_base AS startBase,
                end_base AS endBase,
                out_base AS outBase,

                is_out AS isOut,
                out_number AS outNumber,
                is_scoring_event AS isScoringEvent,
                rbi,
                earned,
                team_unearned AS teamUnearned
            FROM runner_movements
            WHERE game_pk = ?
                AND at_bat_index = ?
                AND runner_index = ?
        `).get(gamePk, atBatIndex, runnerIndex) as {
            gamePk: number
            atBatIndex: number
            runnerIndex: number
            playIndex: number | null
            runnerId: number
            responsiblePitcherId: number | null
            event: string | null
            eventType: string | null
            movementReason: string | null
            originBase: string | null
            startBase: string | null
            endBase: string | null
            outBase: string | null
            isOut: number
            outNumber: number | null
            isScoringEvent: number
            rbi: number
            earned: number
            teamUnearned: number
        } | undefined

        return row
            ? this.mapRow(row)
            : undefined
    }

    public getByPlateAppearance(gamePk: number, atBatIndex: number): RunnerMovement[] {
        const rows = this.database.prepare(`
            SELECT
                game_pk AS gamePk,
                at_bat_index AS atBatIndex,
                runner_index AS runnerIndex,
                play_index AS playIndex,

                runner_id AS runnerId,
                responsible_pitcher_id AS responsiblePitcherId,

                event,
                event_type AS eventType,
                movement_reason AS movementReason,

                origin_base AS originBase,
                start_base AS startBase,
                end_base AS endBase,
                out_base AS outBase,

                is_out AS isOut,
                out_number AS outNumber,
                is_scoring_event AS isScoringEvent,
                rbi,
                earned,
                team_unearned AS teamUnearned
            FROM runner_movements
            WHERE game_pk = ?
                AND at_bat_index = ?
            ORDER BY runner_index
        `).all(gamePk, atBatIndex) as {
            gamePk: number
            atBatIndex: number
            runnerIndex: number
            playIndex: number | null
            runnerId: number
            responsiblePitcherId: number | null
            event: string | null
            eventType: string | null
            movementReason: string | null
            originBase: string | null
            startBase: string | null
            endBase: string | null
            outBase: string | null
            isOut: number
            outNumber: number | null
            isScoringEvent: number
            rbi: number
            earned: number
            teamUnearned: number
        }[]

        return rows.map(row => this.mapRow(row))
    }

    public getByGame(gamePk: number): RunnerMovement[] {
        const rows = this.database.prepare(`
            SELECT
                game_pk AS gamePk,
                at_bat_index AS atBatIndex,
                runner_index AS runnerIndex,
                play_index AS playIndex,

                runner_id AS runnerId,
                responsible_pitcher_id AS responsiblePitcherId,

                event,
                event_type AS eventType,
                movement_reason AS movementReason,

                origin_base AS originBase,
                start_base AS startBase,
                end_base AS endBase,
                out_base AS outBase,

                is_out AS isOut,
                out_number AS outNumber,
                is_scoring_event AS isScoringEvent,
                rbi,
                earned,
                team_unearned AS teamUnearned
            FROM runner_movements
            WHERE game_pk = ?
            ORDER BY at_bat_index, runner_index
        `).all(gamePk) as {
            gamePk: number
            atBatIndex: number
            runnerIndex: number
            playIndex: number | null
            runnerId: number
            responsiblePitcherId: number | null
            event: string | null
            eventType: string | null
            movementReason: string | null
            originBase: string | null
            startBase: string | null
            endBase: string | null
            outBase: string | null
            isOut: number
            outNumber: number | null
            isScoringEvent: number
            rbi: number
            earned: number
            teamUnearned: number
        }[]

        return rows.map(row => this.mapRow(row))
    }

    public getByRunner(playerId: number): RunnerMovement[] {
        const rows = this.database.prepare(`
            SELECT
                game_pk AS gamePk,
                at_bat_index AS atBatIndex,
                runner_index AS runnerIndex,
                play_index AS playIndex,

                runner_id AS runnerId,
                responsible_pitcher_id AS responsiblePitcherId,

                event,
                event_type AS eventType,
                movement_reason AS movementReason,

                origin_base AS originBase,
                start_base AS startBase,
                end_base AS endBase,
                out_base AS outBase,

                is_out AS isOut,
                out_number AS outNumber,
                is_scoring_event AS isScoringEvent,
                rbi,
                earned,
                team_unearned AS teamUnearned
            FROM runner_movements
            WHERE runner_id = ?
            ORDER BY game_pk, at_bat_index, runner_index
        `).all(playerId) as {
            gamePk: number
            atBatIndex: number
            runnerIndex: number
            playIndex: number | null
            runnerId: number
            responsiblePitcherId: number | null
            event: string | null
            eventType: string | null
            movementReason: string | null
            originBase: string | null
            startBase: string | null
            endBase: string | null
            outBase: string | null
            isOut: number
            outNumber: number | null
            isScoringEvent: number
            rbi: number
            earned: number
            teamUnearned: number
        }[]

        return rows.map(row => this.mapRow(row))
    }

    public put(runnerMovement: RunnerMovement): void {
        this.database.prepare(`
            INSERT INTO runner_movements (
                game_pk,
                at_bat_index,
                runner_index,
                play_index,

                runner_id,
                responsible_pitcher_id,

                event,
                event_type,
                movement_reason,

                origin_base,
                start_base,
                end_base,
                out_base,

                is_out,
                out_number,
                is_scoring_event,
                rbi,
                earned,
                team_unearned
            )
            VALUES (
                @gamePk,
                @atBatIndex,
                @runnerIndex,
                @playIndex,

                @runnerId,
                @responsiblePitcherId,

                @event,
                @eventType,
                @movementReason,

                @originBase,
                @startBase,
                @endBase,
                @outBase,

                @isOut,
                @outNumber,
                @isScoringEvent,
                @rbi,
                @earned,
                @teamUnearned
            )
            ON CONFLICT(game_pk, at_bat_index, runner_index) DO UPDATE SET
                play_index = excluded.play_index,

                runner_id = excluded.runner_id,
                responsible_pitcher_id = excluded.responsible_pitcher_id,

                event = excluded.event,
                event_type = excluded.event_type,
                movement_reason = excluded.movement_reason,

                origin_base = excluded.origin_base,
                start_base = excluded.start_base,
                end_base = excluded.end_base,
                out_base = excluded.out_base,

                is_out = excluded.is_out,
                out_number = excluded.out_number,
                is_scoring_event = excluded.is_scoring_event,
                rbi = excluded.rbi,
                earned = excluded.earned,
                team_unearned = excluded.team_unearned
        `).run({
            ...runnerMovement,
            isOut: Number(runnerMovement.isOut),
            isScoringEvent: Number(runnerMovement.isScoringEvent),
            earned: Number(runnerMovement.earned),
            teamUnearned: Number(runnerMovement.teamUnearned)
        })
    }

    public deleteByGame(gamePk: number): void {
        this.database.prepare(`
            DELETE FROM runner_movements
            WHERE game_pk = ?
        `).run(gamePk)
    }

    public getByDateRange(startDate: string, endDate: string): RunnerMovement[] {
        const rows = this.database.prepare(`
            SELECT
                runner_movement.game_pk AS gamePk,
                runner_movement.at_bat_index AS atBatIndex,
                runner_movement.runner_index AS runnerIndex,
                runner_movement.play_index AS playIndex,

                runner_movement.runner_id AS runnerId,
                runner_movement.responsible_pitcher_id AS responsiblePitcherId,

                runner_movement.event,
                runner_movement.event_type AS eventType,
                runner_movement.movement_reason AS movementReason,

                runner_movement.origin_base AS originBase,
                runner_movement.start_base AS startBase,
                runner_movement.end_base AS endBase,
                runner_movement.out_base AS outBase,

                runner_movement.is_out AS isOut,
                runner_movement.out_number AS outNumber,
                runner_movement.is_scoring_event AS isScoringEvent,
                runner_movement.rbi,
                runner_movement.earned,
                runner_movement.team_unearned AS teamUnearned
            FROM runner_movements runner_movement
            JOIN games game
                ON game.game_pk = runner_movement.game_pk
            WHERE game.game_date >= ?
                AND game.game_date < ?
            ORDER BY
                game.game_date,
                runner_movement.game_pk,
                runner_movement.at_bat_index,
                runner_movement.runner_index
        `).all(startDate, endDate) as {
            gamePk: number
            atBatIndex: number
            runnerIndex: number
            playIndex: number | null
            runnerId: number
            responsiblePitcherId: number | null
            event: string | null
            eventType: string | null
            movementReason: string | null
            originBase: string | null
            startBase: string | null
            endBase: string | null
            outBase: string | null
            isOut: number
            outNumber: number | null
            isScoringEvent: number
            rbi: number
            earned: number
            teamUnearned: number
        }[]

        return rows.map(row => this.mapRow(row))
    }

    private mapRow(row: {
        gamePk: number
        atBatIndex: number
        runnerIndex: number
        playIndex: number | null
        runnerId: number
        responsiblePitcherId: number | null
        event: string | null
        eventType: string | null
        movementReason: string | null
        originBase: string | null
        startBase: string | null
        endBase: string | null
        outBase: string | null
        isOut: number
        outNumber: number | null
        isScoringEvent: number
        rbi: number
        earned: number
        teamUnearned: number
    }): RunnerMovement {
        return {
            gamePk: row.gamePk,
            atBatIndex: row.atBatIndex,
            runnerIndex: row.runnerIndex,
            playIndex: row.playIndex,
            runnerId: row.runnerId,
            responsiblePitcherId: row.responsiblePitcherId,
            event: row.event,
            eventType: row.eventType,
            movementReason: row.movementReason,
            originBase: row.originBase,
            startBase: row.startBase,
            endBase: row.endBase,
            outBase: row.outBase,
            isOut: Boolean(row.isOut),
            outNumber: row.outNumber,
            isScoringEvent: Boolean(row.isScoringEvent),
            rbi: row.rbi,
            earned: Boolean(row.earned),
            teamUnearned: Boolean(row.teamUnearned)
        }
    }
}


export {
    RunnerMovementRepository
}

