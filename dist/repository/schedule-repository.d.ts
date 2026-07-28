import type { Database } from "better-sqlite3";
import type { ScheduleResponse } from "mlb-stats-api";
declare class ScheduleRepository {
    private readonly database;
    constructor(database: Database);
    get(season: number): Schedule | undefined;
    put(schedule: Schedule): void;
}
interface Schedule {
    season: number;
    data: ScheduleResponse;
    downloadedAt: string;
}
export { ScheduleRepository };
export type { Schedule };
//# sourceMappingURL=schedule-repository.d.ts.map