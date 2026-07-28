class ScheduleRepository {
    database;
    constructor(database) {
        this.database = database;
    }
    get(season) {
        const row = this.database.prepare(`
            SELECT
                season,
                data,
                downloaded_at
            FROM schedules
            WHERE season = ?
        `).get(season);
        if (!row) {
            return undefined;
        }
        return {
            season: row.season,
            data: JSON.parse(row.data),
            downloadedAt: row.downloaded_at
        };
    }
    put(schedule) {
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
        });
    }
}
export { ScheduleRepository };
//# sourceMappingURL=schedule-repository.js.map