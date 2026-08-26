class DownloadService {
    gameService;
    scheduleRepository;
    rosterRepository;
    api;
    throttleMs;
    scheduleCacheMs;
    rosterCacheMs;
    constructor(gameService, scheduleRepository, rosterRepository, api, throttleMs = 200, scheduleCacheMs = 1000 * 60 * 60, rosterCacheMs = 1000 * 60 * 15) {
        this.gameService = gameService;
        this.scheduleRepository = scheduleRepository;
        this.rosterRepository = rosterRepository;
        this.api = api;
        this.throttleMs = throttleMs;
        this.scheduleCacheMs = scheduleCacheMs;
        this.rosterCacheMs = rosterCacheMs;
    }
    async syncSeason(season, force = false) {
        const syncStartedAt = Date.now();
        console.log(`Starting season ${season} synchronization${force ? " with force enabled" : ""}`);
        const scheduleStartedAt = Date.now();
        const games = await this.getSeasonGames(season, force);
        const scheduleDuration = Date.now() - scheduleStartedAt;
        console.log(`Loaded ${games.length} scheduled games for season ${season} ` +
            `in ${this.formatPreciseDuration(scheduleDuration)}`);
        const completedGamePkQueryStartedAt = Date.now();
        const completedGamePks = force
            ? new Set()
            : new Set(this.gameService.getCompletedGamePksByDateRange(`${season}-01-01`, `${season}-12-31`));
        const completedGamePkQueryDuration = Date.now() - completedGamePkQueryStartedAt;
        console.log(`Loaded ${completedGamePks.size} completed game PKs ` +
            `for season ${season} in ` +
            `${this.formatPreciseDuration(completedGamePkQueryDuration)}`);
        const synchronizedGamePks = new Set();
        const failedGames = [];
        let downloadedGames = 0;
        let cachedGames = 0;
        let skippedGames = 0;
        let cachedCheckDuration = 0;
        let downloadDuration = 0;
        let throttleDuration = 0;
        const loopStartedAt = Date.now();
        for (let index = 0; index < games.length; index++) {
            const scheduledGame = games[index];
            const gamePk = Number(scheduledGame.gamePk);
            const gameDate = this.getGameDate(scheduledGame);
            if (!gamePk || !gameDate || this.isFutureGameDate(gameDate)) {
                skippedGames++;
                continue;
            }
            const cachedCheckStartedAt = Date.now();
            const isCached = !force && completedGamePks.has(gamePk);
            cachedCheckDuration += Date.now() - cachedCheckStartedAt;
            if (isCached) {
                synchronizedGamePks.add(gamePk);
                cachedGames++;
                continue;
            }
            try {
                const downloadStartedAt = Date.now();
                await this.syncGame(gamePk);
                const gameDownloadDuration = Date.now() - downloadStartedAt;
                downloadDuration += gameDownloadDuration;
                synchronizedGamePks.add(gamePk);
                downloadedGames++;
                console.log(`Downloaded ${index + 1}/${games.length} ` +
                    `(gamePk: ${gamePk}, date: ${gameDate}) ` +
                    `in ${this.formatPreciseDuration(gameDownloadDuration)}`);
                if (this.throttleMs > 0) {
                    const throttleStartedAt = Date.now();
                    await this.sleep(this.throttleMs);
                    throttleDuration += Date.now() - throttleStartedAt;
                }
            }
            catch (error) {
                const message = error instanceof Error
                    ? error.message
                    : String(error);
                failedGames.push({
                    gamePk,
                    gameDate,
                    message
                });
                console.error(`Failed game ${gamePk} (${gameDate}): ${message}`);
            }
            if ((index + 1) % 100 === 0 || index === games.length - 1) {
                console.log(`Processed ${index + 1}/${games.length}: ` +
                    `${downloadedGames} downloaded, ` +
                    `${cachedGames} cached, ` +
                    `${skippedGames} skipped, ` +
                    `${failedGames.length} failed, ` +
                    `loop ${this.formatPreciseDuration(Date.now() - loopStartedAt)}`);
            }
        }
        const loopDuration = Date.now() - loopStartedAt;
        const totalDuration = Date.now() - syncStartedAt;
        const unaccountedDuration = Math.max(0, totalDuration -
            scheduleDuration -
            completedGamePkQueryDuration -
            cachedCheckDuration -
            downloadDuration -
            throttleDuration);
        console.log([
            `Season ${season} synchronization timing:`,
            `  Schedule load: ${this.formatPreciseDuration(scheduleDuration)}`,
            `  Completed-PK query: ${this.formatPreciseDuration(completedGamePkQueryDuration)}`,
            `  Cached PK checks: ${this.formatPreciseDuration(cachedCheckDuration)}`,
            `  Game downloads and writes: ${this.formatPreciseDuration(downloadDuration)}`,
            `  Throttling: ${this.formatPreciseDuration(throttleDuration)}`,
            `  Full game loop: ${this.formatPreciseDuration(loopDuration)}`,
            `  Other overhead: ${this.formatPreciseDuration(unaccountedDuration)}`,
            `  Total: ${this.formatPreciseDuration(totalDuration)}`
        ].join("\n"));
        if (failedGames.length > 0) {
            throw new Error([
                `Season ${season} game synchronization failed.`,
                `Download failures: ${failedGames.length}`,
                ...failedGames.map(game => `${game.gameDate} gamePk=${game.gamePk}: ${game.message}`)
            ].join("\n"));
        }
        console.log(`Finished processing season ${season}: ` +
            `${downloadedGames} downloaded, ` +
            `${cachedGames} already complete, ` +
            `${skippedGames} skipped, ` +
            `${this.formatPreciseDuration(totalDuration)}`);
        return synchronizedGamePks;
    }
    async syncRosters(gameDate, force = false) {
        this.validateDate(gameDate);
        const season = Number(gameDate.slice(0, 4));
        const schedule = await this.getSchedule(season, false);
        const scheduleDate = (schedule.data.dates ?? []).find(date => String(date.date ?? "") === gameDate);
        if (!scheduleDate) {
            throw new Error(`No MLB schedule found for ${gameDate}.`);
        }
        const teams = new Map();
        for (const game of scheduleDate.games ?? []) {
            for (const side of [
                "away",
                "home"
            ]) {
                const team = game?.teams?.[side]?.team;
                const teamId = Number(team?.id);
                if (!Number.isFinite(teamId) || teamId <= 0) {
                    continue;
                }
                teams.set(teamId, {
                    id: teamId,
                    name: String(team?.name ??
                        teamId)
                });
            }
        }
        console.log(`Synchronizing ${teams.size} active MLB rosters for ${gameDate}.`);
        let downloaded = 0;
        let cached = 0;
        for (const team of teams.values()) {
            const downloadedAt = this.rosterRepository.getDownloadedAt(gameDate, team.id);
            if (!force &&
                downloadedAt &&
                !this.shouldRefreshRoster(gameDate, downloadedAt)) {
                cached++;
                continue;
            }
            const response = await this.api.getTeamRoster({
                pathParams: {
                    teamId: team.id
                },
                params: {
                    rosterType: "active",
                    date: gameDate
                }
            });
            const roster = response.data.roster ?? [];
            if (roster.length === 0) {
                throw new Error(`MLB returned an empty active roster for ${team.name} (${team.id}) on ${gameDate}.`);
            }
            this.rosterRepository.put(gameDate, team.id, new Date().toISOString(), roster.map((row) => {
                const playerId = Number(row?.person?.id);
                if (!Number.isFinite(playerId) || playerId <= 0) {
                    throw new Error(`MLB roster entry for ${team.name} on ${gameDate} does not contain a valid player ID.`);
                }
                return {
                    playerId,
                    position: String(row?.position?.abbreviation ??
                        "")
                };
            }));
            downloaded++;
            if (this.throttleMs > 0) {
                await this.sleep(this.throttleMs);
            }
        }
        console.log(`Synchronized rosters for ${gameDate}: ` +
            `${downloaded} downloaded, ${cached} cached.`);
    }
    async syncGame(gamePk) {
        const game = {
            gamePk,
            data: await this.downloadGame(gamePk)
        };
        this.gameService.syncGame(game);
        return game;
    }
    async getSchedule(season, force = false) {
        const existing = this.scheduleRepository.get(season);
        if (!force && existing && !this.shouldRefreshSchedule(existing)) {
            return existing;
        }
        const schedule = {
            season,
            data: await this.downloadSchedule(season),
            downloadedAt: new Date().toISOString()
        };
        this.scheduleRepository.put(schedule);
        return schedule;
    }
    async getSeasonGames(season, force) {
        const schedule = await this.getSchedule(season, force);
        const games = new Map();
        for (const date of schedule.data.dates ?? []) {
            for (const scheduleGame of date.games ?? []) {
                const game = scheduleGame;
                const gamePk = Number(game.gamePk);
                if (gamePk) {
                    games.set(gamePk, game);
                }
            }
        }
        return Array.from(games.values()).sort((a, b) => {
            const aDate = this.getGameDate(a) ?? "";
            const bDate = this.getGameDate(b) ?? "";
            if (aDate !== bDate) {
                return aDate.localeCompare(bDate);
            }
            return Number(a.gamePk) - Number(b.gamePk);
        });
    }
    formatPreciseDuration(milliseconds) {
        if (milliseconds < 1000) {
            return `${milliseconds}ms`;
        }
        return `${(milliseconds / 1000).toFixed(2)}s`;
    }
    async downloadSchedule(season) {
        const response = await this.api.getSchedule({
            params: {
                sportId: 1,
                startDate: `${season}-01-01`,
                endDate: `${season}-12-31`,
                gameTypes: "R"
            }
        });
        return response.data;
    }
    async downloadGame(gamePk) {
        const response = await this.api.getGameFeed({
            pathParams: {
                gamePk
            },
            params: {
                hydrate: "credits,alignment,flags,officials"
            }
        });
        return response.data;
    }
    shouldRefreshSchedule(schedule) {
        if (!this.isCurrentSeason(schedule.season)) {
            return false;
        }
        const downloadedAt = new Date(schedule.downloadedAt).getTime();
        if (!Number.isFinite(downloadedAt)) {
            return true;
        }
        return Date.now() - downloadedAt > this.scheduleCacheMs;
    }
    shouldRefreshRoster(gameDate, downloadedAt) {
        const today = new Date().toISOString().slice(0, 10);
        if (gameDate < today) {
            return false;
        }
        const downloadedTime = new Date(downloadedAt).getTime();
        if (!Number.isFinite(downloadedTime)) {
            return true;
        }
        return Date.now() - downloadedTime > this.rosterCacheMs;
    }
    getGameDate(game) {
        return game.officialDate ??
            game.gameDate?.slice(0, 10);
    }
    isCurrentSeason(season) {
        return season === new Date().getUTCFullYear();
    }
    isFutureGameDate(gameDate) {
        const gameTime = new Date(`${gameDate}T00:00:00.000Z`).getTime();
        if (!Number.isFinite(gameTime)) {
            return false;
        }
        const now = new Date();
        const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
        return gameTime > today;
    }
    validateDate(date) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            throw new Error(`Invalid date: ${date}.`);
        }
        const parsed = new Date(`${date}T12:00:00.000Z`);
        if (Number.isNaN(parsed.getTime()) ||
            parsed.toISOString().slice(0, 10) !== date) {
            throw new Error(`Invalid date: ${date}.`);
        }
    }
    async sleep(milliseconds) {
        await new Promise(resolve => setTimeout(resolve, milliseconds));
    }
}
export { DownloadService };
//# sourceMappingURL=download-service.js.map