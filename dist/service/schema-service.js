import fs from "fs";
import path from "path";
import BetterSqlite3 from "better-sqlite3";
class SchemaService {
    databasePath;
    database;
    constructor(databasePath) {
        this.databasePath = databasePath;
    }
    load() {
        if (this.database) {
            return this.database;
        }
        const databaseExists = this.databasePath !== ":memory:" && fs.existsSync(this.databasePath);
        if (this.databasePath !== ":memory:") {
            fs.mkdirSync(path.dirname(this.databasePath), { recursive: true });
        }
        const database = new BetterSqlite3(this.databasePath);
        database.pragma("busy_timeout = 5000");
        database.pragma("foreign_keys = ON");
        if (this.databasePath !== ":memory:") {
            database.pragma("journal_mode = WAL");
            database.pragma("synchronous = OFF");
            database.pragma("wal_autocheckpoint = 0");
            database.pragma("temp_store = MEMORY");
            database.pragma("cache_size = -262144");
            database.pragma("cache_spill = OFF");
        }
        if (!databaseExists) {
            database.exec(createQuery);
        }
        this.database = database;
        return database;
    }
    transaction(callback) {
        if (!this.database) {
            throw new Error("Database has not been loaded");
        }
        return this.database.transaction(callback)();
    }
    close() {
        if (!this.database) {
            return;
        }
        if (this.databasePath !== ":memory:") {
            this.database.pragma("wal_checkpoint(TRUNCATE)");
        }
        this.database.close();
        this.database = undefined;
    }
}
const createQuery = `
    CREATE TABLE games (
        game_pk INTEGER PRIMARY KEY,
        data TEXT NOT NULL,

        game_date TEXT GENERATED ALWAYS AS (
            json_extract(data, '$.gameData.datetime.officialDate')
        ) STORED,

        abstract_game_state TEXT GENERATED ALWAYS AS (
            json_extract(data, '$.gameData.status.abstractGameState')
        ) STORED,

        coded_game_state TEXT GENERATED ALWAYS AS (
            json_extract(data, '$.gameData.status.codedGameState')
        ) STORED,

        detailed_state TEXT GENERATED ALWAYS AS (
            json_extract(data, '$.gameData.status.detailedState')
        ) STORED,

        status_code TEXT GENERATED ALWAYS AS (
            json_extract(data, '$.gameData.status.statusCode')
        ) STORED
    );

    CREATE INDEX idx_games_game_date
        ON games(game_date);

    CREATE INDEX idx_games_status
        ON games(coded_game_state);

    CREATE INDEX idx_games_date_completed
        ON games(
            game_date,
            abstract_game_state
        );

    CREATE TABLE schedules (
        season INTEGER PRIMARY KEY,
        data TEXT NOT NULL,
        downloaded_at TEXT NOT NULL
    );

    CREATE TABLE player_appearances (
        game_pk INTEGER NOT NULL,
        player_id INTEGER NOT NULL,
        team_id INTEGER NOT NULL,

        appeared_as_batter INTEGER NOT NULL,
        appeared_as_pitcher INTEGER NOT NULL,
        appeared_as_runner INTEGER NOT NULL,
        appeared_as_fielder INTEGER NOT NULL,

        started_as_batter INTEGER NOT NULL,
        started_as_pitcher INTEGER NOT NULL,
        started_as_fielder INTEGER NOT NULL,

        PRIMARY KEY (
            game_pk,
            player_id
        ),

        FOREIGN KEY (game_pk)
            REFERENCES games(game_pk)
            ON DELETE CASCADE
    );

    CREATE INDEX idx_player_appearances_player
        ON player_appearances(player_id);

    CREATE INDEX idx_player_appearances_team
        ON player_appearances(team_id);

    CREATE TABLE plate_appearances (
        game_pk INTEGER NOT NULL,
        at_bat_index INTEGER NOT NULL,

        inning INTEGER NOT NULL,
        half_inning TEXT NOT NULL,
        is_top_inning INTEGER NOT NULL,

        batter_id INTEGER NOT NULL,
        pitcher_id INTEGER NOT NULL,

        bat_side_code TEXT,
        pitch_hand_code TEXT,

        result_type TEXT,
        event TEXT,
        event_type TEXT,
        description TEXT,

        rbi INTEGER NOT NULL,

        away_score INTEGER NOT NULL,
        home_score INTEGER NOT NULL,

        balls INTEGER NOT NULL,
        strikes INTEGER NOT NULL,
        outs INTEGER NOT NULL,

        start_time TEXT,
        end_time TEXT,

        is_complete INTEGER NOT NULL,

        PRIMARY KEY (
            game_pk,
            at_bat_index
        ),

        FOREIGN KEY (game_pk)
            REFERENCES games(game_pk)
            ON DELETE CASCADE
    );

    CREATE INDEX idx_plate_appearances_batter
        ON plate_appearances(batter_id);

    CREATE INDEX idx_plate_appearances_pitcher
        ON plate_appearances(pitcher_id);

    CREATE TABLE pitches (
        game_pk INTEGER NOT NULL,
        at_bat_index INTEGER NOT NULL,
        event_index INTEGER NOT NULL,

        play_id TEXT,
        pitch_number INTEGER,

        start_time TEXT,
        end_time TEXT,

        description TEXT,
        code TEXT,

        pitch_type_code TEXT,
        pitch_type_description TEXT,

        call_code TEXT,
        call_description TEXT,

        is_in_play INTEGER NOT NULL,
        is_strike INTEGER NOT NULL,
        is_ball INTEGER NOT NULL,
        is_scoring_play INTEGER NOT NULL,
        has_review INTEGER NOT NULL,

        balls INTEGER,
        strikes INTEGER,
        outs INTEGER,

        start_speed REAL,
        end_speed REAL,

        strike_zone_top REAL,
        strike_zone_bottom REAL,

        zone INTEGER,
        type_confidence REAL,

        plate_time REAL,
        extension REAL,

        coordinate_a_x REAL,
        coordinate_a_y REAL,
        coordinate_a_z REAL,

        coordinate_pfx_x REAL,
        coordinate_pfx_z REAL,

        coordinate_p_x REAL,
        coordinate_p_z REAL,

        coordinate_v_x_0 REAL,
        coordinate_v_y_0 REAL,
        coordinate_v_z_0 REAL,

        coordinate_x REAL,
        coordinate_x_0 REAL,

        coordinate_y REAL,
        coordinate_y_0 REAL,

        coordinate_z_0 REAL,

        break_angle REAL,
        break_length REAL,
        break_y REAL,

        break_vertical REAL,
        break_vertical_induced REAL,
        break_horizontal REAL,

        spin_rate REAL,
        spin_direction REAL,

        launch_speed REAL,
        launch_angle REAL,
        total_distance REAL,

        trajectory TEXT,
        hardness TEXT,

        hit_location INTEGER,
        hit_coordinate_x REAL,
        hit_coordinate_y REAL,

        PRIMARY KEY (
            game_pk,
            at_bat_index,
            event_index
        ),

        FOREIGN KEY (
            game_pk,
            at_bat_index
        )
            REFERENCES plate_appearances(
                game_pk,
                at_bat_index
            )
            ON DELETE CASCADE
    );

    CREATE INDEX idx_pitches_game
        ON pitches(game_pk);

    CREATE TABLE runner_movements (
        game_pk INTEGER NOT NULL,
        at_bat_index INTEGER NOT NULL,
        runner_index INTEGER NOT NULL,

        play_index INTEGER,

        runner_id INTEGER NOT NULL,
        responsible_pitcher_id INTEGER,

        event TEXT,
        event_type TEXT,
        movement_reason TEXT,

        origin_base TEXT,
        start_base TEXT,
        end_base TEXT,
        out_base TEXT,

        is_out INTEGER NOT NULL,
        out_number INTEGER,

        is_scoring_event INTEGER NOT NULL,

        rbi INTEGER NOT NULL,
        earned INTEGER NOT NULL,
        team_unearned INTEGER NOT NULL,

        PRIMARY KEY (
            game_pk,
            at_bat_index,
            runner_index
        ),

        FOREIGN KEY (
            game_pk,
            at_bat_index
        )
            REFERENCES plate_appearances(
                game_pk,
                at_bat_index
            )
            ON DELETE CASCADE
    );

    CREATE INDEX idx_runner_movements_runner
        ON runner_movements(runner_id);

    CREATE TABLE fielding_credits (
        game_pk INTEGER NOT NULL,
        at_bat_index INTEGER NOT NULL,
        runner_index INTEGER NOT NULL,
        credit_index INTEGER NOT NULL,

        player_id INTEGER NOT NULL,

        credit TEXT NOT NULL,

        position_code TEXT,
        position_name TEXT,
        position_type TEXT,
        position_abbreviation TEXT,

        PRIMARY KEY (
            game_pk,
            at_bat_index,
            runner_index,
            credit_index
        ),

        FOREIGN KEY (
            game_pk,
            at_bat_index,
            runner_index
        )
            REFERENCES runner_movements(
                game_pk,
                at_bat_index,
                runner_index
            )
            ON DELETE CASCADE
    );

    CREATE INDEX idx_fielding_credits_player
        ON fielding_credits(player_id);

    CREATE TABLE defensive_events (
        game_pk INTEGER NOT NULL,
        at_bat_index INTEGER NOT NULL,
        event_index INTEGER NOT NULL,

        team_id INTEGER NOT NULL,
        player_id INTEGER NOT NULL,

        event_type TEXT NOT NULL,

        from_position TEXT,
        to_position TEXT,

        PRIMARY KEY (
            game_pk,
            at_bat_index,
            event_index,
            player_id
        ),

        FOREIGN KEY (game_pk)
            REFERENCES games(game_pk)
            ON DELETE CASCADE
    );

    CREATE INDEX idx_defensive_events_player
        ON defensive_events(player_id);

    CREATE INDEX idx_defensive_events_team
        ON defensive_events(team_id);



    CREATE INDEX idx_player_appearances_player_game
        ON player_appearances(player_id, game_pk);

    CREATE INDEX idx_plate_appearances_batter_game
        ON plate_appearances(batter_id, game_pk);

    CREATE INDEX idx_plate_appearances_pitcher_game
        ON plate_appearances(pitcher_id, game_pk);

    CREATE INDEX idx_pitches_game_at_bat
        ON pitches(game_pk, at_bat_index);

    CREATE INDEX idx_runner_movements_runner_game
        ON runner_movements(runner_id, game_pk);

    CREATE INDEX idx_runner_movements_responsible_pitcher_game
        ON runner_movements(responsible_pitcher_id, game_pk);

    CREATE INDEX idx_fielding_credits_player_game
        ON fielding_credits(player_id, game_pk);

    CREATE INDEX idx_defensive_events_player_game
        ON defensive_events(player_id, game_pk);



`;
export { SchemaService };
//# sourceMappingURL=schema-service.js.map