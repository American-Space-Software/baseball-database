#!/usr/bin/env node
import type BetterSqlite3 from "better-sqlite3";
import { DefensiveEvent } from "./repository/defensive-event-repository.js";
import { FieldingCredit } from "./repository/fielding-credit-repository.js";
import { Roster } from "./repository/roster-repository.js";
import { GameSyncHook } from "./service/game-service.js";
import { Game, Pitch, PlateAppearance, PlayerAppearance, RunnerMovement, Schedule, StatExport } from "./repository/interfaces.js";
declare const database: BetterSqlite3.Database;
declare function getGame(gamePk: number): Game | undefined;
declare function getSchedule(season: number): Schedule | undefined;
declare function getPlayer(playerId: number): import("./repository/player-repository.js").Player | undefined;
declare function getPlayers(): import("./repository/player-repository.js").Player[];
declare function getRoster(gameDate: string, teamId: number): Roster[];
declare function getStatExport(startDate: string, endDate: string): StatExport;
declare function getCompletedGamePksByDateRange(startDate: string, endDate: string): number[];
declare function syncGame(game: Game): void;
declare function syncRosters(gameDate: string, force?: boolean): Promise<void>;
declare function downloadSeason(season: number, force?: boolean): Promise<Set<number>>;
declare function downloadSeasons(startSeason: number, endSeason: number, force?: boolean): Promise<Map<number, Set<number>>>;
declare function setGameSyncHooks(hooks: GameSyncHook[]): void;
declare const queries: {
    getGame: typeof getGame;
    getPlayer: typeof getPlayer;
    getPlayers: typeof getPlayers;
    getRoster: typeof getRoster;
    getSchedule: typeof getSchedule;
    getStatExport: typeof getStatExport;
    getCompletedGamePksByDateRange: typeof getCompletedGamePksByDateRange;
};
declare const hooks: {
    setGameSyncHooks: typeof setGameSyncHooks;
};
export { database, downloadSeason, downloadSeasons, hooks, queries, syncGame, syncRosters };
export type { DefensiveEvent, FieldingCredit, Pitch, PlateAppearance, PlayerAppearance, Roster, RunnerMovement, Schedule, StatExport };
//# sourceMappingURL=index.d.ts.map