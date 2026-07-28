import type { Database } from "better-sqlite3";
declare class SchemaService {
    private readonly databasePath;
    private database?;
    constructor(databasePath: string);
    load(): Database;
    close(): void;
}
export { SchemaService };
//# sourceMappingURL=schema-service.d.ts.map