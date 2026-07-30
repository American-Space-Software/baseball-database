import type { Database } from "better-sqlite3";
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
interface PlayerAppearance {
    gamePk: number;
    playerId: number;
    teamId: number;
    appearedAsBatter: boolean;
    appearedAsPitcher: boolean;
    appearedAsRunner: boolean;
    appearedAsFielder: boolean;
    startedAsBatter: boolean;
    startedAsPitcher: boolean;
    startedAsFielder: boolean;
}
export { PlayerAppearanceRepository };
export type { PlayerAppearance };
//# sourceMappingURL=player-appearance-repository.d.ts.map