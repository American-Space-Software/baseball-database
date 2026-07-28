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
        if (this.databasePath !== ":memory:") {
            database.pragma("journal_mode = WAL");
        }
        if (!databaseExists) {
            database.exec(`
                CREATE TABLE games (
                    game_pk INTEGER PRIMARY KEY,
                    data TEXT NOT NULL
                );

                CREATE TABLE schedules (
                    season INTEGER PRIMARY KEY,
                    data TEXT NOT NULL,
                    downloaded_at TEXT NOT NULL
                );
            `);
        }
        this.database = database;
        return database;
    }
    close() {
        if (!this.database) {
            return;
        }
        this.database.close();
        this.database = undefined;
    }
}
export { SchemaService };
//# sourceMappingURL=schema-service.js.map