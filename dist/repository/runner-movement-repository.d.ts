import type { Database } from "better-sqlite3";
import { RunnerMovement } from "./interfaces.js";
declare class RunnerMovementRepository {
    private readonly database;
    constructor(database: Database);
    get(gamePk: number, atBatIndex: number, runnerIndex: number): RunnerMovement | undefined;
    getByPlateAppearance(gamePk: number, atBatIndex: number): RunnerMovement[];
    getByGame(gamePk: number): RunnerMovement[];
    getByRunner(playerId: number): RunnerMovement[];
    put(runnerMovement: RunnerMovement): void;
    deleteByGame(gamePk: number): void;
    getByDateRange(startDate: string, endDate: string): RunnerMovement[];
    private mapRow;
}
export { RunnerMovementRepository };
//# sourceMappingURL=runner-movement-repository.d.ts.map