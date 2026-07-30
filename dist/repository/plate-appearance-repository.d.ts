import type { Database } from "better-sqlite3";
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
interface PlateAppearance {
    gamePk: number;
    atBatIndex: number;
    inning: number;
    halfInning: string;
    isTopInning: boolean;
    batterId: number;
    pitcherId: number;
    batSideCode: string | null;
    pitchHandCode: string | null;
    resultType: string | null;
    event: string | null;
    eventType: string | null;
    description: string | null;
    rbi: number;
    awayScore: number;
    homeScore: number;
    balls: number;
    strikes: number;
    outs: number;
    startTime: string | null;
    endTime: string | null;
    isComplete: boolean;
}
export { PlateAppearanceRepository };
export type { PlateAppearance };
//# sourceMappingURL=plate-appearance-repository.d.ts.map