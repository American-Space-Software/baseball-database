import type { GameFeedResponse, ScheduleResponse } from "mlb-stats-api";
import { RosterRepository } from "../repository/roster-repository.js";
import { ScheduleRepository } from "../repository/schedule-repository.js";
import { GameService } from "./game-service.js";
import { Game, Schedule } from "../repository/interfaces.js";
declare class DownloadService {
    private readonly gameService;
    private readonly scheduleRepository;
    private readonly rosterRepository;
    private readonly api;
    private readonly throttleMs;
    private readonly scheduleCacheMs;
    private readonly rosterCacheMs;
    constructor(gameService: GameService, scheduleRepository: ScheduleRepository, rosterRepository: RosterRepository, api: MLBStatsAPIClient, throttleMs?: number, scheduleCacheMs?: number, rosterCacheMs?: number);
    syncSeason(season: number, force?: boolean): Promise<Set<number>>;
    syncRosters(gameDate: string, force?: boolean): Promise<void>;
    syncGame(gamePk: number): Promise<Game>;
    getSchedule(season: number, force?: boolean): Promise<Schedule>;
    private getSeasonGames;
    private formatPreciseDuration;
    private downloadSchedule;
    private downloadGame;
    private shouldRefreshSchedule;
    private shouldRefreshRoster;
    private getGameDate;
    private isCurrentSeason;
    private isFutureGameDate;
    private validateDate;
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
    getTeamRoster(options: {
        pathParams: {
            teamId: number;
        };
        params: {
            rosterType: string;
            date: string;
        };
    }): Promise<{
        data: {
            roster?: any[];
        };
    }>;
}
export { DownloadService };
export type { MLBStatsAPIClient };
//# sourceMappingURL=download-service.d.ts.map