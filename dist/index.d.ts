#!/usr/bin/env node
import type BetterSqlite3 from "better-sqlite3";
declare const database: BetterSqlite3.Database;
declare function getGame(gamePk: number): import("./repository/game-repository.js").Game | undefined;
declare function getSchedule(season: number): import("./repository/schedule-repository.js").Schedule | undefined;
declare function getStatExport(startDate: string, endDate: string): import("./service/stat-export-service.js").StatExport;
declare function downloadSeason(season: number, force?: boolean): Promise<Set<number>>;
declare function downloadSeasons(startSeason: number, endSeason: number, force?: boolean): Promise<Map<number, Set<number>>>;
declare const queries: {
    getGame: typeof getGame;
    getSchedule: typeof getSchedule;
    getStatExport: typeof getStatExport;
};
export { downloadSeason, downloadSeasons, queries, database };
//# sourceMappingURL=index.d.ts.map