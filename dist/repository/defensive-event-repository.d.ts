import type { Database } from "better-sqlite3";
declare class DefensiveEventRepository {
    private readonly database;
    constructor(database: Database);
    get(gamePk: number, atBatIndex: number, eventIndex: number, playerId: number): DefensiveEvent | undefined;
    getByGame(gamePk: number): DefensiveEvent[];
    getByDateRange(startDate: string, endDate: string): DefensiveEvent[];
    put(defensiveEvent: DefensiveEvent): void;
    deleteByGame(gamePk: number): void;
}
interface DefensiveEvent {
    gamePk: number;
    atBatIndex: number;
    eventIndex: number;
    teamId: number;
    playerId: number;
    eventType: "starting_assignment" | "defensive_substitution" | "position_switch" | "pitching_change" | "removal";
    fromPosition: "P" | "C" | "1B" | "2B" | "3B" | "SS" | "LF" | "CF" | "RF" | "DH" | null;
    toPosition: "P" | "C" | "1B" | "2B" | "3B" | "SS" | "LF" | "CF" | "RF" | "DH" | null;
}
export { DefensiveEventRepository };
export type { DefensiveEvent };
//# sourceMappingURL=defensive-event-repository.d.ts.map