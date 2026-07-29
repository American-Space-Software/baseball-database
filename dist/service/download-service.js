class DownloadService {
    gameService;
    scheduleRepository;
    api;
    throttleMs;
    scheduleCacheMs;
    constructor(gameService, scheduleRepository, api, throttleMs = 200, scheduleCacheMs = 1000 * 60 * 60) {
        this.gameService = gameService;
        this.scheduleRepository = scheduleRepository;
        this.api = api;
        this.throttleMs = throttleMs;
        this.scheduleCacheMs = scheduleCacheMs;
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
    getGameDate(game) {
        return game.officialDate ?? game.gameDate?.slice(0, 10);
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
    async sleep(milliseconds) {
        await new Promise(resolve => setTimeout(resolve, milliseconds));
    }
}
export { DownloadService };
//# sourceMappingURL=download-service.js.map