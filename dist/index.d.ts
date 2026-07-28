#!/usr/bin/env node
export declare function getGame(gamePk: number): import("./repository/game-repository.js").Game | undefined;
export declare function getSchedule(season: number): import("./repository/schedule-repository.js").Schedule | undefined;
export declare function downloadSeason(season: number, force?: boolean): Promise<Set<number>>;
export declare function downloadSeasons(startSeason: number, endSeason: number, force?: boolean): Promise<Map<number, Set<number>>>;
//# sourceMappingURL=index.d.ts.map