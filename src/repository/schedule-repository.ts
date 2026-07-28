import type { Database } from "better-sqlite3"
import type { ScheduleResponse } from "mlb-stats-api"

class ScheduleRepository {

    public constructor(private readonly database: Database) {}

    public get(season: number): Schedule | undefined {
        const row = this.database.prepare(`
            SELECT
                season,
                data,
                downloaded_at
            FROM schedules
            WHERE season = ?
        `).get(season) as {
            season: number
            data: string
            downloaded_at: string
        } | undefined

        if (!row) {
            return undefined
        }

        return {
            season: row.season,
            data: JSON.parse(row.data) as ScheduleResponse,
            downloadedAt: row.downloaded_at
        }
    }

    public put(schedule: Schedule): void {
        this.database.prepare(`
            INSERT INTO schedules (
                season,
                data,
                downloaded_at
            )
            VALUES (
                @season,
                @data,
                @downloadedAt
            )
            ON CONFLICT(season) DO UPDATE SET
                data = excluded.data,
                downloaded_at = excluded.downloaded_at
        `).run({
            season: schedule.season,
            data: JSON.stringify(schedule.data),
            downloadedAt: schedule.downloadedAt
        })
    }
}

interface Schedule {
    season: number
    data: ScheduleResponse
    downloadedAt: string
}

export {
    ScheduleRepository
}

export type {
    Schedule
}