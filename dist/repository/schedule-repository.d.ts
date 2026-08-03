import type { Database } from "better-sqlite3";
import { Schedule } from "./interfaces.js";
declare class ScheduleRepository {
    private readonly database;
    constructor(database: Database);
    get(season: number): Schedule | undefined;
    put(schedule: Schedule): void;
}
export { ScheduleRepository };
//# sourceMappingURL=schedule-repository.d.ts.map