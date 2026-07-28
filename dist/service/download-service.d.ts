import type { GameFeedResponse, ScheduleResponse } from "mlb-stats-api";
import { GameRepository } from "../repository/game-repository.js";
import type { Game } from "../repository/game-repository.js";
import { ScheduleRepository } from "../repository/schedule-repository.js";
import type { Schedule } from "../repository/schedule-repository.js";
declare class DownloadService {
    private readonly gameRepository;
    private readonly scheduleRepository;
    private readonly api;
    private readonly throttleMs;
    private readonly scheduleCacheMs;
    constructor(gameRepository: GameRepository, scheduleRepository: ScheduleRepository, api: MLBStatsAPIClient, throttleMs?: number, scheduleCacheMs?: number);
    syncSeason(season: number, force?: boolean): Promise<Set<number>>;
    syncGame(gamePk: number, force?: boolean): Promise<DownloadResult>;
    getSchedule(season: number, force?: boolean): Promise<Schedule>;
    private getSeasonGames;
    private downloadSchedule;
    private downloadGame;
    private shouldRefreshSchedule;
    private getGameDate;
    private isCurrentSeason;
    private isFutureGameDate;
    private isGameComplete;
    private isGameTerminal;
    private sleep;
}
interface MLBStatsAPIClient {
    getSchedule(options: {
        params: {
            sportId: number;
            startDate: string;
            endDate: string;
            gameTypes: string;
        };
    }): Promise<{
        data: ScheduleResponse;
    }>;
    getGameFeed(options: {
        pathParams: {
            gamePk: number;
        };
        params: {
            hydrate: string;
        };
    }): Promise<{
        data: GameFeedResponse;
    }>;
}
interface DownloadResult {
    game: Game;
    downloaded: boolean;
}
export { DownloadService };
export type { DownloadResult, MLBStatsAPIClient };
//# sourceMappingURL=download-service.d.ts.map