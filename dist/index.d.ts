#!/usr/bin/env node
import { DefensiveEvent } from "./repository/defensive-event-repository.js";
import { FieldingCredit } from "./repository/fielding-credit-repository.js";
import { Pitch } from "./repository/pitch-repository.js";
import { PlateAppearance } from "./repository/plate-appearance-repository.js";
import { PlayerAppearance } from "./repository/player-appearance-repository.js";
import { RunnerMovement } from "./repository/runner-movement-repository.js";
import { Schedule } from "./repository/schedule-repository.js";
import { StatExport } from "./service/stat-export-service.js";
import type BetterSqlite3 from "better-sqlite3";
declare const database: BetterSqlite3.Database;
declare function getGame(gamePk: number): import("./repository/game-repository.js").Game | undefined;
declare function getSchedule(season: number): Schedule | undefined;
declare function getStatExport(startDate: string, endDate: string): StatExport;
declare function downloadSeason(season: number, force?: boolean): Promise<Set<number>>;
declare function downloadSeasons(startSeason: number, endSeason: number, force?: boolean): Promise<Map<number, Set<number>>>;
declare const queries: {
    getGame: typeof getGame;
    getSchedule: typeof getSchedule;
    getStatExport: typeof getStatExport;
};
export { downloadSeason, downloadSeasons, queries, database };
export type { StatExport, FieldingCredit, Pitch, PlateAppearance, PlayerAppearance, RunnerMovement, DefensiveEvent, Schedule };
//# sourceMappingURL=index.d.ts.map