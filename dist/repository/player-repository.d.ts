import Database from "better-sqlite3";
interface Player {
    playerId: number;
    firstName: string;
    lastName: string;
    fullName: string;
    primaryPosition: string | null;
    bats: string | null;
    throws: string | null;
    birthDate: string | null;
    birthCity: string | null;
    birthCountry: string | null;
    height: string | null;
    weight: number | null;
    mlbDebutDate: string | null;
    primaryNumber: string | null;
    nickName: string | null;
}
declare class PlayerRepository {
    private readonly getStatement;
    private readonly getAllStatement;
    private readonly putStatement;
    constructor(database: Database.Database);
    get(playerId: number): Player | undefined;
    getAll(): Player[];
    put(player: Player): void;
}
export { PlayerRepository };
export type { Player };
//# sourceMappingURL=player-repository.d.ts.map