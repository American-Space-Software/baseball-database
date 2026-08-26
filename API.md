# API

The package exports download functions, roster synchronization, game synchronization, query helpers, TypeScript interfaces, and direct access to the initialized SQLite database.

```ts
import {
    database,
    downloadSeason,
    downloadSeasons,
    hooks,
    queries,
    syncGame,
    syncRosters
} from "baseball-database"

import type {
    DefensiveEvent,
    FieldingCredit,
    FieldingCreditRow,
    Game,
    GameDate,
    GameRow,
    GameSyncHook,
    Pitch,
    PlateAppearance,
    PlayerAppearance,
    Roster,
    RunnerMovement,
    Schedule,
    StatExport
} from "baseball-database"