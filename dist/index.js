#!/usr/bin/env node
import path from "path";
import { fileURLToPath } from "url";
import MLBStatsAPI from "mlb-stats-api";
import { GameRepository } from "./repository/game-repository.js";
import { ScheduleRepository } from "./repository/schedule-repository.js";
import { DownloadService } from "./service/download-service.js";
import { SchemaService } from "./service/schema-service.js";
const databasePath = process.env.BASEBALL_DATABASE_PATH ?? path.resolve(process.cwd(), "data/baseball.sqlite");
const throttleMs = process.env.THROTTLE_MS ? parseInt(process.env.THROTTLE_MS) : 200;
const schemaService = new SchemaService(databasePath);
const database = schemaService.load();
const gameRepository = new GameRepository(database);
const scheduleRepository = new ScheduleRepository(database);
const downloadService = new DownloadService(gameRepository, scheduleRepository, new MLBStatsAPI(), throttleMs);
export function getGame(gamePk) {
    return gameRepository.get(gamePk);
}
export function getSchedule(season) {
    return scheduleRepository.get(season);
}
export async function downloadSeason(season, force = false) {
    return downloadService.syncSeason(season, force);
}
export async function downloadSeasons(startSeason, endSeason, force = false) {
    const results = new Map();
    for (let season = startSeason; season <= endSeason; season++) {
        console.log(`\n=== Synchronizing ${season} ===`);
        results.set(season, await downloadService.syncSeason(season, force));
    }
    return results;
}
async function run() {
    const force = process.argv.includes("--force");
    const seasons = process.argv.slice(2).filter(argument => argument !== "--force").map(Number);
    if (seasons.length === 1) {
        await downloadSeason(seasons[0], force);
        return;
    }
    if (seasons.length === 2) {
        await downloadSeasons(seasons[0], seasons[1], force);
        return;
    }
    throw new Error("Expected one season or a start and end season.");
}
function isMainModule() {
    return !!process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
}
if (isMainModule()) {
    run()
        .catch(error => {
        console.error(error);
        process.exitCode = 1;
    })
        .finally(() => schemaService.close());
}
//# sourceMappingURL=index.js.map