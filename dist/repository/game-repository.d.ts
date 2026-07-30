import type { Database } from "better-sqlite3";
import type { GameFeedResponse } from "mlb-stats-api";
declare class GameRepository {
    private readonly database;
    constructor(database: Database);
    get(gamePk: number): Game | undefined;
    getByPks(gamePks: number[]): Game[];
    getByDateRange(startDate: string, endDate: string): Game[];
    getCompletedByDate(date: string): Game[];
    getCompletedByDateRange(startDate: string, endDate: string): Game[];
    getCompletedGamePksByDate(date: string): number[];
    getCompletedGamePksByDateRange(startDate: string, endDate: string): number[];
    put(game: Game): void;
    private mapRow;
}
interface Game {
    gamePk: number;
    data: GameFeedResponse;
    gameDate?: string | null;
    abstractGameState?: string | null;
    codedGameState?: string | null;
    detailedState?: string | null;
    statusCode?: string | null;
}
export { GameRepository };
export type { Game };
//# sourceMappingURL=game-repository.d.ts.map