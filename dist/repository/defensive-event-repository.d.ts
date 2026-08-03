import type { Database } from "better-sqlite3";
import { DefensiveEvent } from "./interfaces.js";
declare class DefensiveEventRepository {
    private readonly database;
    constructor(database: Database);
    get(gamePk: number, atBatIndex: number, eventIndex: number, playerId: number): DefensiveEvent | undefined;
    getByGame(gamePk: number): DefensiveEvent[];
    getByDateRange(startDate: string, endDate: string): DefensiveEvent[];
    put(defensiveEvent: DefensiveEvent): void;
    deleteByGame(gamePk: number): void;
}
export { DefensiveEventRepository };
export type { DefensiveEvent };
//# sourceMappingURL=defensive-event-repository.d.ts.map