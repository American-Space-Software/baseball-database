import type { Database } from "better-sqlite3";
import type { GameFeedResponse } from "mlb-stats-api";
declare class GameRepository {
    private readonly database;
    constructor(database: Database);
    get(gamePk: number): Game | undefined;
    put(game: Game): void;
}
interface Game {
    gamePk: number;
    data: GameFeedResponse;
}
export { GameRepository };
export type { Game };
//# sourceMappingURL=game-repository.d.ts.map