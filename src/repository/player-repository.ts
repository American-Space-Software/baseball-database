import Database from "better-sqlite3"


interface Player {
    playerId: number
    firstName: string
    lastName: string
    fullName: string
    primaryPosition: string | null
    bats: string | null
    throws: string | null
    birthDate: string | null
    birthCity: string | null
    birthCountry: string | null
    height: string | null
    weight: number | null
    mlbDebutDate: string | null
    primaryNumber: string | null
    nickName: string | null
}


class PlayerRepository {

    private readonly getStatement: Database.Statement
    private readonly getAllStatement: Database.Statement
    private readonly putStatement: Database.Statement

    public constructor(database: Database.Database) {
        this.getStatement = database.prepare(`
            SELECT
                player_id AS playerId,
                first_name AS firstName,
                last_name AS lastName,
                full_name AS fullName,
                primary_position AS primaryPosition,
                bats,
                throws,
                birth_date AS birthDate,
                birth_city AS birthCity,
                birth_country AS birthCountry,
                height,
                weight,
                mlb_debut_date AS mlbDebutDate,
                primary_number AS primaryNumber,
                nick_name AS nickName
            FROM players
            WHERE player_id = ?
        `)

        this.getAllStatement = database.prepare(`
            SELECT
                player_id AS playerId,
                first_name AS firstName,
                last_name AS lastName,
                full_name AS fullName,
                primary_position AS primaryPosition,
                bats,
                throws,
                birth_date AS birthDate,
                birth_city AS birthCity,
                birth_country AS birthCountry,
                height,
                weight,
                mlb_debut_date AS mlbDebutDate,
                primary_number AS primaryNumber,
                nick_name AS nickName
            FROM players
            ORDER BY player_id
        `)

        this.putStatement = database.prepare(`
            INSERT INTO players (
                player_id,
                first_name,
                last_name,
                full_name,
                primary_position,
                bats,
                throws,
                birth_date,
                birth_city,
                birth_country,
                height,
                weight,
                mlb_debut_date,
                primary_number,
                nick_name
            ) VALUES (
                @playerId,
                @firstName,
                @lastName,
                @fullName,
                @primaryPosition,
                @bats,
                @throws,
                @birthDate,
                @birthCity,
                @birthCountry,
                @height,
                @weight,
                @mlbDebutDate,
                @primaryNumber,
                @nickName
            )
            ON CONFLICT(player_id) DO UPDATE SET
                first_name = excluded.first_name,
                last_name = excluded.last_name,
                full_name = excluded.full_name,
                primary_position = excluded.primary_position,
                bats = excluded.bats,
                throws = excluded.throws,
                birth_date = excluded.birth_date,
                birth_city = excluded.birth_city,
                birth_country = excluded.birth_country,
                height = excluded.height,
                weight = excluded.weight,
                mlb_debut_date = excluded.mlb_debut_date,
                primary_number = excluded.primary_number,
                nick_name = excluded.nick_name
        `)
    }

    public get(playerId: number): Player | undefined {
        return this.getStatement.get(playerId) as Player | undefined
    }

    public getAll(): Player[] {
        return this.getAllStatement.all() as Player[]
    }

    public put(player: Player): void {
        this.putStatement.run(player)
    }

}


export {
    PlayerRepository
}

export type {
    Player
}