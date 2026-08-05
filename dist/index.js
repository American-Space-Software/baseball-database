#!/usr/bin/env node
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import MLBStatsAPI from "mlb-stats-api";
import { DefensiveEventRepository } from "./repository/defensive-event-repository.js";
import { FieldingCreditRepository } from "./repository/fielding-credit-repository.js";
import { GameRepository } from "./repository/game-repository.js";
import { PitchRepository } from "./repository/pitch-repository.js";
import { PlateAppearanceRepository } from "./repository/plate-appearance-repository.js";
import { PlayerAppearanceRepository } from "./repository/player-appearance-repository.js";
import { RunnerMovementRepository } from "./repository/runner-movement-repository.js";
import { ScheduleRepository } from "./repository/schedule-repository.js";
import { DownloadService } from "./service/download-service.js";
import { GameService } from "./service/game-service.js";
import { SchemaService } from "./service/schema-service.js";
import { StatExportService } from "./service/stat-export-service.js";
const databasePath = process.env.BASEBALL_DATABASE_PATH ??
    path.resolve(process.cwd(), "data/baseball.sqlite");
const throttleMs = process.env.THROTTLE_MS
    ? parseInt(process.env.THROTTLE_MS)
    : 200;
const schemaService = new SchemaService(databasePath);
const database = schemaService.load();
const gameRepository = new GameRepository(database);
const playerAppearanceRepository = new PlayerAppearanceRepository(database);
const plateAppearanceRepository = new PlateAppearanceRepository(database);
const pitchRepository = new PitchRepository(database);
const runnerMovementRepository = new RunnerMovementRepository(database);
const fieldingCreditRepository = new FieldingCreditRepository(database);
const scheduleRepository = new ScheduleRepository(database);
const defensiveEventRepository = new DefensiveEventRepository(database);
const statExportService = new StatExportService(gameRepository, playerAppearanceRepository, plateAppearanceRepository, pitchRepository, runnerMovementRepository, fieldingCreditRepository, defensiveEventRepository);
const gameService = new GameService(schemaService, gameRepository, playerAppearanceRepository, plateAppearanceRepository, pitchRepository, runnerMovementRepository, fieldingCreditRepository, defensiveEventRepository);
const downloadService = new DownloadService(gameService, scheduleRepository, new MLBStatsAPI(), throttleMs);
function getGame(gamePk) {
    return gameService.get(gamePk);
}
function getSchedule(season) {
    return scheduleRepository.get(season);
}
function getStatExport(startDate, endDate) {
    return statExportService.getByDateRange(startDate, endDate);
}
function getCompletedGamePksByDateRange(startDate, endDate) {
    return gameRepository.getCompletedGamePksByDateRange(startDate, endDate);
}
async function downloadSeason(season, force = false) {
    return downloadService.syncSeason(season, force);
}
async function downloadSeasons(startSeason, endSeason, force = false) {
    const results = new Map();
    for (let season = startSeason; season <= endSeason; season++) {
        console.log(`\n=== Synchronizing ${season} ===`);
        results.set(season, await downloadService.syncSeason(season, force));
    }
    return results;
}
function setGameSyncHooks(hooks) { }
const queries = {
    getGame,
    getSchedule,
    getStatExport,
    getCompletedGamePksByDateRange
};
const hooks = {
    setGameSyncHooks
};
async function run() {
    const force = process.argv.includes("--force");
    const seasons = process.argv
        .slice(2)
        .filter(argument => argument !== "--force")
        .map(Number);
    if (seasons.some(season => !Number.isInteger(season))) {
        throw new Error("Every season must be a valid integer.");
    }
    if (seasons.length === 1) {
        await downloadSeason(seasons[0], force);
        return;
    }
    if (seasons.length === 2) {
        const [startSeason, endSeason] = seasons;
        if (startSeason > endSeason) {
            throw new Error("The start season cannot be after the end season.");
        }
        await downloadSeasons(startSeason, endSeason, force);
        return;
    }
    throw new Error("Expected one season or a start and end season.");
}
function isMainModule() {
    if (!process.argv[1]) {
        return false;
    }
    try {
        return fs.realpathSync(process.argv[1]) === fs.realpathSync(fileURLToPath(import.meta.url));
    }
    catch {
        return false;
    }
}
if (isMainModule()) {
    run()
        .catch((error) => {
        console.error(error);
        process.exitCode = 1;
    })
        .finally(() => {
        schemaService.close();
    });
}
export { downloadSeason, downloadSeasons, queries, database, hooks };
//# sourceMappingURL=index.js.map