import type { Database } from "better-sqlite3";
import { PlateAppearance } from "./interfaces.js";
declare class PlateAppearanceRepository {
    private readonly database;
    constructor(database: Database);
    get(gamePk: number, atBatIndex: number): PlateAppearance | undefined;
    getByGame(gamePk: number): PlateAppearance[];
    getByBatter(playerId: number): PlateAppearance[];
    getByPitcher(playerId: number): PlateAppearance[];
    getByDateRange(startDate: string, endDate: string): PlateAppearance[];
    put(plateAppearance: PlateAppearance): void;
    deleteByGame(gamePk: number): void;
    private mapRow;
}
export { PlateAppearanceRepository };
//# sourceMappingURL=plate-appearance-repository.d.ts.map