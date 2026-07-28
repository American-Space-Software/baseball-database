class DownloadService {
    gameRepository;
    scheduleRepository;
    api;
    throttleMs;
    scheduleCacheMs;
    constructor(gameRepository, scheduleRepository, api, throttleMs = 200, scheduleCacheMs = 1000 * 60 * 60) {
        this.gameRepository = gameRepository;
        this.scheduleRepository = scheduleRepository;
        this.api = api;
        this.throttleMs = throttleMs;
        this.scheduleCacheMs = scheduleCacheMs;
    }
    async syncSeason(season, force = false) {
        const games = await this.getSeasonGames(season, force);
        const synchronizedGamePks = new Set();
        const failedGames = [];
        console.log(`Processing ${games.length} games for season ${season}`);
        for (let index = 0; index < games.length; index++) {
            const scheduledGame = games[index];
            const gamePk = Number(scheduledGame.gamePk);
            const gameDate = this.getGameDate(scheduledGame);
            if (!gamePk || !gameDate || this.isFutureGameDate(gameDate)) {
                continue;
            }
            try {
                const result = await this.syncGame(gamePk, force);
                synchronizedGamePks.add(gamePk);
                console.log(`Processed ${index + 1}/${games.length} ` +
                    `(gamePk: ${gamePk}, date: ${gameDate}, downloaded: ${result.downloaded})`);
                if (result.downloaded && this.throttleMs > 0) {
                    await this.sleep(this.throttleMs);
                }
            }
            catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                failedGames.push({
                    gamePk,
                    gameDate,
                    message
                });
                console.error(`Failed game ${gamePk} (${gameDate}): ${message}`);
            }
        }
        if (failedGames.length > 0) {
            throw new Error([
                `Season ${season} game synchronization failed.`,
                `Download failures: ${failedGames.length}`,
                ...failedGames.map(game => `${game.gameDate} gamePk=${game.gamePk}: ${game.message}`)
            ].join("\n"));
        }
        console.log(`Finished processing season ${season}: ${synchronizedGamePks.size} games synchronized`);
        return synchronizedGamePks;
    }
    async syncGame(gamePk, force = false) {
        const existing = this.gameRepository.get(gamePk);
        if (!force && existing && this.isGameTerminal(existing.data)) {
            return {
                game: existing,
                downloaded: false
            };
        }
        const game = {
            gamePk,
            data: await this.downloadGame(gamePk)
        };
        this.gameRepository.put(game);
        return {
            game,
            downloaded: true
        };
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
                if (!gamePk) {
                    continue;
                }
                games.set(gamePk, game);
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
    isGameComplete(data) {
        const abstractState = String(data.gameData?.status?.abstractGameState ?? "");
        const codedState = String(data.gameData?.status?.codedGameState ?? "");
        const detailedState = String(data.gameData?.status?.detailedState ?? "");
        return abstractState === "Final" ||
            codedState === "F" ||
            detailedState === "Final" ||
            detailedState === "Completed Early";
    }
    isGameTerminal(data) {
        if (this.isGameComplete(data)) {
            return true;
        }
        const detailedState = String(data.gameData?.status?.detailedState ?? "").toLowerCase();
        return detailedState.includes("cancelled") ||
            detailedState.includes("canceled") ||
            detailedState.includes("postponed");
    }
    async sleep(milliseconds) {
        await new Promise(resolve => setTimeout(resolve, milliseconds));
    }
}
export { DownloadService };
//# sourceMappingURL=download-service.js.map