#!/usr/bin/env node
import { DefensiveEvent } from "./repository/defensive-event-repository.js";
import { FieldingCredit } from "./repository/fielding-credit-repository.js";
import { GameSyncHook } from "./service/game-service.js";
import { Pitch, PlateAppearance, PlayerAppearance, RunnerMovement, Schedule, StatExport } from "./repository/interfaces.js";
import type BetterSqlite3 from "better-sqlite3";
declare const database: BetterSqlite3.Database;
declare function getGame(gamePk: number): import("./repository/interfaces.js").Game | undefined;
declare function getSchedule(season: number): Schedule | undefined;
declare function getStatExport(startDate: string, endDate: string): StatExport;
declare function downloadSeason(season: number, force?: boolean): Promise<Set<number>>;
declare function downloadSeasons(startSeason: number, endSeason: number, force?: boolean): Promise<Map<number, Set<number>>>;
declare function setGameSyncHooks(hooks: GameSyncHook[]): void;
declare const queries: {
    getGame: typeof getGame;
    getSchedule: typeof getSchedule;
    getStatExport: typeof getStatExport;
};
declare const hooks: {
    setGameSyncHooks: typeof setGameSyncHooks;
};
export { downloadSeason, downloadSeasons, queries, database, hooks };
export type { StatExport, FieldingCredit, Pitch, PlateAppearance, PlayerAppearance, RunnerMovement, Schedule, DefensiveEvent, };
//# sourceMappingURL=index.d.ts.map