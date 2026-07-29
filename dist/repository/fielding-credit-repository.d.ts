import type { Database } from "better-sqlite3";
declare class FieldingCreditRepository {
    private readonly database;
    constructor(database: Database);
    get(gamePk: number, atBatIndex: number, runnerIndex: number, creditIndex: number): FieldingCredit | undefined;
    getByRunnerMovement(gamePk: number, atBatIndex: number, runnerIndex: number): FieldingCredit[];
    getByPlateAppearance(gamePk: number, atBatIndex: number): FieldingCredit[];
    getByGame(gamePk: number): FieldingCredit[];
    getByPlayer(playerId: number): FieldingCredit[];
    put(fieldingCredit: FieldingCredit): void;
    deleteByGame(gamePk: number): void;
    private mapRow;
}
interface FieldingCredit {
    gamePk: number;
    atBatIndex: number;
    runnerIndex: number;
    creditIndex: number;
    playerId: number;
    credit: string;
    positionCode: string | null;
    positionName: string | null;
    positionType: string | null;
    positionAbbreviation: string | null;
}
export { FieldingCreditRepository };
export type { FieldingCredit };
//# sourceMappingURL=fielding-credit-repository.d.ts.map