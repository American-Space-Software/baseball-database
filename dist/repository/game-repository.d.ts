import type { Database } from "better-sqlite3";
import { Game, GameDate } from "./interfaces.js";
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
    getGameDatesByDateRange(startDate: string, endDate: string): GameDate[];
    private mapRow;
}
export { GameRepository };
//# sourceMappingURL=game-repository.d.ts.map