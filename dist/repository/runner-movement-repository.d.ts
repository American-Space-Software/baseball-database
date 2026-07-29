import type { Database } from "better-sqlite3";
declare class RunnerMovementRepository {
    private readonly database;
    constructor(database: Database);
    get(gamePk: number, atBatIndex: number, runnerIndex: number): RunnerMovement | undefined;
    getByPlateAppearance(gamePk: number, atBatIndex: number): RunnerMovement[];
    getByGame(gamePk: number): RunnerMovement[];
    getByRunner(playerId: number): RunnerMovement[];
    put(runnerMovement: RunnerMovement): void;
    deleteByGame(gamePk: number): void;
    private mapRow;
}
interface RunnerMovement {
    gamePk: number;
    atBatIndex: number;
    runnerIndex: number;
    playIndex: number | null;
    runnerId: number;
    responsiblePitcherId: number | null;
    event: string | null;
    eventType: string | null;
    movementReason: string | null;
    originBase: string | null;
    startBase: string | null;
    endBase: string | null;
    outBase: string | null;
    isOut: boolean;
    outNumber: number | null;
    isScoringEvent: boolean;
    rbi: number;
    earned: boolean;
    teamUnearned: boolean;
}
export { RunnerMovementRepository };
export type { RunnerMovement };
//# sourceMappingURL=runner-movement-repository.d.ts.map