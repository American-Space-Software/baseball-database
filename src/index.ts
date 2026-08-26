#!/usr/bin/env node

import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

import type BetterSqlite3 from "better-sqlite3"

import MLBStatsAPI from "mlb-stats-api"

import { DefensiveEvent, DefensiveEventRepository } from "./repository/defensive-event-repository.js"
import { FieldingCredit, FieldingCreditRepository } from "./repository/fielding-credit-repository.js"
import { GameRepository } from "./repository/game-repository.js"
import { PitchRepository } from "./repository/pitch-repository.js"
import { PlateAppearanceRepository } from "./repository/plate-appearance-repository.js"
import { PlayerAppearanceRepository } from "./repository/player-appearance-repository.js"
import { PlayerRepository } from "./repository/player-repository.js"
import { Roster, RosterRepository } from "./repository/roster-repository.js"
import { RunnerMovementRepository } from "./repository/runner-movement-repository.js"
import { ScheduleRepository } from "./repository/schedule-repository.js"

import { DownloadService } from "./service/download-service.js"
import { GameService, GameSyncHook } from "./service/game-service.js"
import { SchemaService } from "./service/schema-service.js"
import { StatExportService } from "./service/stat-export-service.js"

import { Game, Pitch, PlateAppearance, PlayerAppearance, RunnerMovement, Schedule, StatExport } from "./repository/interfaces.js"


const databasePath = process.env.BASEBALL_DATABASE_PATH ?? path.resolve(process.cwd(), "data/baseball.sqlite")
const throttleMs = process.env.THROTTLE_MS ? parseInt(process.env.THROTTLE_MS) : 200

const schemaService = new SchemaService(databasePath)
const database: BetterSqlite3.Database = schemaService.load()

const gameRepository = new GameRepository(database)
const playerAppearanceRepository = new PlayerAppearanceRepository(database)
const plateAppearanceRepository = new PlateAppearanceRepository(database)
const pitchRepository = new PitchRepository(database)
const runnerMovementRepository = new RunnerMovementRepository(database)
const fieldingCreditRepository = new FieldingCreditRepository(database)
const scheduleRepository = new ScheduleRepository(database)
const defensiveEventRepository = new DefensiveEventRepository(database)
const playerRepository = new PlayerRepository(database)
const rosterRepository = new RosterRepository(database)

const statExportService = new StatExportService(
    gameRepository,
    playerAppearanceRepository,
    plateAppearanceRepository,
    pitchRepository,
    runnerMovementRepository,
    fieldingCreditRepository,
    defensiveEventRepository
)

const gameService = new GameService(
    schemaService,
    gameRepository,
    playerAppearanceRepository,
    plateAppearanceRepository,
    pitchRepository,
    runnerMovementRepository,
    fieldingCreditRepository,
    defensiveEventRepository,
    playerRepository,
    rosterRepository
)

const downloadService = new DownloadService(
    gameService,
    scheduleRepository,
    rosterRepository,
    new MLBStatsAPI(),
    throttleMs
)


function getGame(gamePk: number) {
    return gameService.get(gamePk)
}

function getSchedule(season: number) {
    return scheduleRepository.get(season)
}

function getPlayer(playerId: number) {
    return playerRepository.get(playerId)
}

function getPlayers() {
    return playerRepository.getAll()
}

function getRoster(gameDate: string, teamId: number): Roster[] {
    return rosterRepository.get(gameDate, teamId)
}

function getStatExport(startDate: string, endDate: string) {
    return statExportService.getByDateRange(startDate, endDate)
}

function getCompletedGamePksByDateRange(startDate: string, endDate: string): number[] {
    return gameRepository.getCompletedGamePksByDateRange(startDate, endDate)
}

function syncGame(game: Game): void {
    gameService.syncGame(game)
}

async function syncRosters(gameDate: string, force = false): Promise<void> {
    await downloadService.syncRosters(gameDate, force)
}

async function downloadSeason(season: number, force = false): Promise<Set<number>> {
    return downloadService.syncSeason(season, force)
}

async function downloadSeasons(startSeason: number, endSeason: number, force = false): Promise<Map<number, Set<number>>> {
    const results = new Map<number, Set<number>>()

    for (let season = startSeason; season <= endSeason; season++) {
        console.log(`\n=== Synchronizing ${season} ===`)

        results.set(
            season,
            await downloadService.syncSeason(season, force)
        )
    }

    return results
}

function setGameSyncHooks(hooks: GameSyncHook[]): void {
    gameService.gameSyncHooks = hooks
}


const queries = {
    getGame,
    getPlayer,
    getPlayers,
    getRoster,
    getSchedule,
    getStatExport,
    getCompletedGamePksByDateRange
}

const hooks = {
    setGameSyncHooks
}


async function run(): Promise<void> {
    const force = process.argv.includes("--force")

    const seasons = process.argv
        .slice(2)
        .filter(argument => argument !== "--force")
        .map(Number)

    if (seasons.some(season => !Number.isInteger(season))) {
        throw new Error("Every season must be a valid integer.")
    }

    if (seasons.length === 1) {
        await downloadSeason(seasons[0], force)
        return
    }

    if (seasons.length === 2) {
        const [startSeason, endSeason] = seasons

        if (startSeason > endSeason) {
            throw new Error("The start season cannot be after the end season.")
        }

        await downloadSeasons(startSeason, endSeason, force)
        return
    }

    throw new Error("Expected one season or a start and end season.")
}

function isMainModule(): boolean {
    if (!process.argv[1]) {
        return false
    }

    try {
        return fs.realpathSync(process.argv[1]) === fs.realpathSync(fileURLToPath(import.meta.url))
    } catch {
        return false
    }
}


if (isMainModule()) {
    run()
        .catch((error: unknown) => {
            console.error(error)
            process.exitCode = 1
        })
        .finally(() => {
            schemaService.close()
        })
}


export {
    database,
    downloadSeason,
    downloadSeasons,
    hooks,
    queries,
    syncGame,
    syncRosters
}


export type {
    DefensiveEvent,
    FieldingCredit,
    Pitch,
    PlateAppearance,
    PlayerAppearance,
    Roster,
    RunnerMovement,
    Schedule,
    StatExport
}