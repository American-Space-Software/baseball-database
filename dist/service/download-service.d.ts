import type { GameFeedResponse, ScheduleResponse } from "mlb-stats-api";
import { ScheduleRepository } from "../repository/schedule-repository.js";
import { GameService } from "./game-service.js";
import { Game, Schedule } from "../repository/interfaces.js";
declare class DownloadService {
    private readonly gameService;
    private readonly scheduleRepository;
    private readonly api;
    private readonly throttleMs;
    private readonly scheduleCacheMs;
    constructor(gameService: GameService, scheduleRepository: ScheduleRepository, api: MLBStatsAPIClient, throttleMs?: number, scheduleCacheMs?: number);
    syncSeason(season: number, force?: boolean): Promise<Set<number>>;
    syncGame(gamePk: number): Promise<Game>;
    getSchedule(season: number, force?: boolean): Promise<Schedule>;
    private getSeasonGames;
    private formatPreciseDuration;
    private downloadSchedule;
    private downloadGame;
    private shouldRefreshSchedule;
    private getGameDate;
    private isCurrentSeason;
    private isFutureGameDate;
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
export { DownloadService };
export type { MLBStatsAPIClient };
//# sourceMappingURL=download-service.d.ts.map