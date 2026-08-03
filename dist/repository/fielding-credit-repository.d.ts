import type { Database } from "better-sqlite3";
import { FieldingCredit } from "./interfaces.js";
declare class FieldingCreditRepository {
    private readonly database;
    constructor(database: Database);
    get(gamePk: number, atBatIndex: number, runnerIndex: number, creditIndex: number): FieldingCredit | undefined;
    getByRunnerMovement(gamePk: number, atBatIndex: number, runnerIndex: number): FieldingCredit[];
    getByPlateAppearance(gamePk: number, atBatIndex: number): FieldingCredit[];
    getByGame(gamePk: number): FieldingCredit[];
    getByPlayer(playerId: number): FieldingCredit[];
    getByDateRange(startDate: string, endDate: string): FieldingCredit[];
    put(fieldingCredit: FieldingCredit): void;
    deleteByGame(gamePk: number): void;
    private mapRow;
}
export { FieldingCreditRepository };
export type { FieldingCredit };
//# sourceMappingURL=fielding-credit-repository.d.ts.map