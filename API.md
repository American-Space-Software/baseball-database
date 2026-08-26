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
    Pitch,
    PlateAppearance,
    PlayerAppearance,
    Roster,
    RunnerMovement,
    Schedule,
    StatExport
} from "baseball-database"
```

## Queries

Read data from the local baseball database through the exported `queries` object.

### `queries.getGame(gamePk)`

Returns a stored game by MLB game PK.

```ts
const game = queries.getGame(777001)
```

### `queries.getPlayer(playerId)`

Returns a player by MLB player ID.

```ts
const player = queries.getPlayer(660271)
```

### `queries.getPlayers()`

Returns all stored players, ordered by MLB player ID.

```ts
const players = queries.getPlayers()
```

### `queries.getRoster(gameDate, teamId)`

Returns the stored roster for a team on a specific date.

```ts
const roster = queries.getRoster(
    "2026-08-26",
    147
)
```

### `queries.getSchedule(season)`

Returns the stored MLB schedule for a season.

```ts
const schedule = queries.getSchedule(2026)
```

### `queries.getStatExport(startDate, endDate)`

Returns a stat export for the requested date range.

```ts
const stats = queries.getStatExport(
    "2026-08-01",
    "2026-08-26"
)
```

### `queries.getCompletedGamePksByDateRange(startDate, endDate)`

Returns the MLB game PKs for completed games within a date range.

```ts
const gamePks = queries.getCompletedGamePksByDateRange(
    "2026-08-01",
    "2026-08-26"
)
```

## Downloading Seasons

### `downloadSeason(season, force?)`

Synchronizes a single MLB season.

```ts
const downloadedGamePks = await downloadSeason(2026)
```

Pass `true` as the second argument to force synchronization.

```ts
const downloadedGamePks = await downloadSeason(
    2026,
    true
)
```

### `downloadSeasons(startSeason, endSeason, force?)`

Synchronizes an inclusive range of MLB seasons.

```ts
const results = await downloadSeasons(
    2024,
    2026
)
```

The result is a `Map<number, Set<number>>` keyed by season.

## Roster Synchronization

### `syncRosters(gameDate, force?)`

Synchronizes MLB rosters for a specific date.

```ts
await syncRosters("2026-08-26")
```

Pass `true` as the second argument to force synchronization.

```ts
await syncRosters(
    "2026-08-26",
    true
)
```

## Game Synchronization

### `syncGame(game)`

Stores a game and its associated baseball data.

```ts
syncGame(game)
```

## Game Sync Hooks

Game synchronization hooks can be registered through `hooks.setGameSyncHooks()`.

```ts
hooks.setGameSyncHooks([
    {
        run: game => {
            console.log(`Synchronized game ${game.gamePk}`)
        }
    }
])
```

Hooks run after a game is synchronized.

## Database

The initialized `better-sqlite3` database instance is exported directly when lower-level database access is needed.

```ts
const rows = database
    .prepare(`
        SELECT *
        FROM players
        ORDER BY player_id
    `)
    .all()
```
