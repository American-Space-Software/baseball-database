import type { Database } from "better-sqlite3";
import { Pitch } from "./interfaces.js";
declare class PitchRepository {
    private readonly database;
    constructor(database: Database);
    get(gamePk: number, atBatIndex: number, eventIndex: number): Pitch | undefined;
    getByPlateAppearance(gamePk: number, atBatIndex: number): Pitch[];
    getByGame(gamePk: number): Pitch[];
    getByDateRange(startDate: string, endDate: string): Pitch[];
    put(pitch: Pitch): void;
    deleteByGame(gamePk: number): void;
    private mapRow;
}
export { PitchRepository };
//# sourceMappingURL=pitch-repository.d.ts.map