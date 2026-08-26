import type { Database } from "better-sqlite3";
declare class RosterRepository {
    private readonly database;
    constructor(database: Database);
    get(date: string, teamId: number): Roster[];
    getDownloadedAt(date: string, teamId: number): string | undefined;
    put(date: string, teamId: number, downloadedAt: string, rosters: {
        playerId: number;
        position: string;
    }[]): void;
}
interface Roster {
    date: string;
    teamId: number;
    playerId: number;
    position: string;
    downloadedAt: string;
}
export { RosterRepository };
export type { Roster };
//# sourceMappingURL=roster-repository.d.ts.map