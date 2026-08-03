import type { Database } from "better-sqlite3";
import { PlayerAppearance } from "./interfaces.js";
declare class PlayerAppearanceRepository {
    private readonly database;
    constructor(database: Database);
    get(gamePk: number, playerId: number): PlayerAppearance | undefined;
    getByGame(gamePk: number): PlayerAppearance[];
    getByPlayer(playerId: number): PlayerAppearance[];
    getByDateRange(startDate: string, endDate: string): PlayerAppearance[];
    put(appearance: PlayerAppearance): void;
    deleteByGame(gamePk: number): void;
    private mapRow;
}
export { PlayerAppearanceRepository };
//# sourceMappingURL=player-appearance-repository.d.ts.map