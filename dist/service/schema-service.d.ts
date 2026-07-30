import type { Database } from "better-sqlite3";
declare class SchemaService {
    private readonly databasePath;
    private database?;
    constructor(databasePath: string);
    load(): Database;
    transaction<T>(callback: () => T): T;
    close(): void;
}
export { SchemaService };
//# sourceMappingURL=schema-service.d.ts.map