# API

The package exports download functions, query helpers, TypeScript interfaces, and direct access to the initialized SQLite database.

```ts
import {
    database,
    downloadSeason,
    downloadSeasons,
    hooks,
    queries
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
    RunnerMovement,
    Schedule,
    StatExport
} from "baseball-database"
```

---

# Download Functions

## `downloadSeason()`

Downloads and synchronizes every game for a season.

```ts
import { downloadSeason } from "baseball-database"

await downloadSeason(2025)
```

Force a complete re-download:

```ts
import { downloadSeason } from "baseball-database"

await downloadSeason(2025, true)
```

Games that have reached a final state are downloaded once and reused automatically. Games that are missing or still in progress are refreshed until they become final.

---

## `downloadSeasons()`

Downloads an inclusive range of seasons.

```ts
import { downloadSeasons } from "baseball-database"

await downloadSeasons(2023, 2025)
```

Equivalent to:

```ts
import { downloadSeason } from "baseball-database"

await downloadSeason(2023)
await downloadSeason(2024)
await downloadSeason(2025)
```

---

# Game Sync Hooks

Applications can register hooks that execute after every game is synchronized.

Hooks run after the normalized tables have been rebuilt and inside the same database transaction. If a hook throws an error, the complete game synchronization is rolled back.

This allows applications to maintain their own derived tables, materialized data, caches, or application-specific analytics whenever a game is synchronized.

## Register a hook

```ts
import {
    database,
    downloadSeason,
    hooks
} from "baseball-database"

import type {
    Game,
    GameSyncHook
} from "baseball-database"

database.exec(`
    CREATE TABLE IF NOT EXISTS synchronized_games (
        game_pk INTEGER PRIMARY KEY,
        synchronized_at TEXT NOT NULL
    )
`)

const synchronizedGameHook: GameSyncHook = {
    run(game: Game): void {
        database
            .prepare(`
                INSERT INTO synchronized_games (
                    game_pk,
                    synchronized_at
                ) VALUES (
                    @gamePk,
                    @synchronizedAt
                )
                ON CONFLICT(game_pk) DO UPDATE SET
                    synchronized_at = excluded.synchronized_at
            `)
            .run({
                gamePk: game.gamePk,
                synchronizedAt: new Date().toISOString()
            })
    }
}

hooks.setGameSyncHooks([
    synchronizedGameHook
])

await downloadSeason(2025)
```

The hook receives the complete `Game` object and can execute SQL directly through the exported `database` connection.

The example creates an application-owned table and writes one row whenever a game is synchronized. Applications can use the same pattern to maintain materialized statistics, simulation inputs, machine-learning features, or other derived data.

Multiple hooks may be registered:

```ts
hooks.setGameSyncHooks([
    firstHook,
    secondHook
])
```

Hooks execute in the order they are provided.

---

# Query Helpers

## `queries.getGame()`

Returns a previously downloaded MLB game.

```ts
import { queries } from "baseball-database"

import type { Game } from "baseball-database"

const game: Game | undefined = queries.getGame(777858)
```

Returns `undefined` if the game has not been downloaded.

---

## `queries.getSchedule()`

Returns a previously downloaded season schedule.

```ts
import { queries } from "baseball-database"

import type { Schedule } from "baseball-database"

const schedule: Schedule | undefined = queries.getSchedule(2025)
```

Returns `undefined` if the season has not been downloaded.

---

## `queries.getStatExport()`

Returns a normalized relational export covering every game in the requested date range.

```ts
import { queries } from "baseball-database"

import type { StatExport } from "baseball-database"

const exportData: StatExport = queries.getStatExport(
    "2025-04-01",
    "2025-04-30"
)
```

The returned export contains every normalized record for the requested date range, including games, player appearances, plate appearances, pitches, runner movements, fielding credits, and defensive events.

---

# Database Access

The initialized `better-sqlite3` database connection is exported directly.

## Query pitches

```ts
import { database } from "baseball-database"

import type { Pitch } from "baseball-database"

const pitches: Pitch[] = database
    .prepare(`
        SELECT *
        FROM pitches
        WHERE pitcher_id = ?
    `)
    .all(694973) as Pitch[]
```

Applications are free to execute arbitrary SQL directly against the database.

---

## Execute aggregate queries

```ts
import { database } from "baseball-database"

interface PitchCount {
    pitches: number
}

const result: PitchCount = database
    .prepare(`
        SELECT COUNT(*) AS pitches
        FROM pitches
    `)
    .get() as PitchCount
```

Because SQL queries can return arbitrary shapes, aggregate queries are typically mapped to small application-specific interfaces.

---

# TypeScript Interfaces

## `GameSyncHook`

Represents application code that runs after a game has been synchronized.

```ts
interface GameSyncHook {
    run(game: Game): void
}
```

| Property | Type | Description |
|---|---|---|
| `run` | `(game: Game) => void` | Executes after the game and all normalized rows have been stored. |

Hooks execute inside the same database transaction as the game synchronization.

---

## `Game`

Represents a complete MLB game feed exactly as returned by the MLB Stats API.

```ts
interface Game {
    gamePk: number
    data: GameFeedResponse
    gameDate?: string | null
    abstractGameState?: string | null
    codedGameState?: string | null
    detailedState?: string | null
    statusCode?: string | null
}
```

| Property | Type | Description |
|---|---|---|
| `gamePk` | `number` | MLB game identifier. |
| `data` | `GameFeedResponse` | Complete MLB game feed. |
| `gameDate` | `string \| null` | Official game date. |
| `abstractGameState` | `string \| null` | High-level game status. |
| `codedGameState` | `string \| null` | MLB coded game status. |
| `detailedState` | `string \| null` | Detailed game status. |
| `statusCode` | `string \| null` | MLB status code. |

---

## `GameRow`

Internal database representation of a stored game.

```ts
interface GameRow {
    gamePk: number
    data: string
    gameDate: string | null
    abstractGameState: string | null
    codedGameState: string | null
    detailedState: string | null
    statusCode: string | null
}
```

---

## `GameDate`

Represents a downloaded game included in a statistical export.

```ts
interface GameDate {
    gamePk: number
    gameDate: string
}
```

---

## `Schedule`

Represents a downloaded MLB schedule.

```ts
interface Schedule {
    season: number
    data: ScheduleResponse
    downloadedAt: string
}
```

| Property | Type | Description |
|---|---|---|
| `season` | `number` | MLB season. |
| `data` | `ScheduleResponse` | Complete schedule returned by MLB. |
| `downloadedAt` | `string` | Timestamp when the schedule was downloaded. |

---

## `PlayerAppearance`

Represents a player's participation within a single game.

```ts
interface PlayerAppearance {
    gamePk: number
    playerId: number
    teamId: number
    appearedAsBatter: boolean
    appearedAsPitcher: boolean
    appearedAsRunner: boolean
    appearedAsFielder: boolean
    startedAsBatter: boolean
    startedAsPitcher: boolean
    startedAsFielder: boolean
}
```

---

## `PlateAppearance`

Represents one completed or in-progress plate appearance.

```ts
interface PlateAppearance {
    gamePk: number
    atBatIndex: number
    inning: number
    halfInning: string
    isTopInning: boolean
    batterId: number
    pitcherId: number
    batSideCode: string | null
    pitchHandCode: string | null
    resultType: string | null
    event: string | null
    eventType: string | null
    description: string | null
    rbi: number
    awayScore: number
    homeScore: number
    balls: number
    strikes: number
    outs: number
    startTime: string | null
    endTime: string | null
    isComplete: boolean
}
```

---

## `Pitch`

Represents a single pitch, including Statcast pitch tracking and batted-ball data when available.

```ts
interface Pitch {
    gamePk: number
    atBatIndex: number
    eventIndex: number
    plateAppearanceId: string
    batterId: number
    pitcherId: number
    playId: string | null
    pitchNumber: number | null
    startTime: string | null
    endTime: string | null

    description: string | null
    code: string | null
    pitchTypeCode: string | null
    pitchTypeDescription: string | null
    callCode: string | null
    callDescription: string | null

    isInPlay: boolean
    isStrike: boolean
    isBall: boolean
    isScoringPlay: boolean
    hasReview: boolean

    balls: number | null
    strikes: number | null
    outs: number | null

    startSpeed: number | null
    endSpeed: number | null
    strikeZoneTop: number | null
    strikeZoneBottom: number | null
    zone: number | null
    typeConfidence: number | null
    plateTime: number | null
    extension: number | null

    coordinateAX: number | null
    coordinateAY: number | null
    coordinateAZ: number | null
    coordinatePfxX: number | null
    coordinatePfxZ: number | null
    coordinatePX: number | null
    coordinatePZ: number | null
    coordinateVX0: number | null
    coordinateVY0: number | null
    coordinateVZ0: number | null
    coordinateX: number | null
    coordinateX0: number | null
    coordinateY: number | null
    coordinateY0: number | null
    coordinateZ0: number | null

    breakAngle: number | null
    breakLength: number | null
    breakY: number | null
    breakVertical: number | null
    breakVerticalInduced: number | null
    breakHorizontal: number | null
    spinRate: number | null
    spinDirection: number | null

    launchSpeed: number | null
    launchAngle: number | null
    totalDistance: number | null
    trajectory: string | null
    hardness: string | null
    hitLocation: number | null
    hitCoordinateX: number | null
    hitCoordinateY: number | null
}
```

The `Pitch` interface exposes nearly every pitch-level measurement available from the MLB Stats API, including pitch characteristics, trajectory, movement, strike zone location, and Statcast batted-ball measurements.

---

## `RunnerMovement`

Represents a baserunner advancing, scoring, or being put out during a plate appearance.

```ts
interface RunnerMovement {
    gamePk: number
    atBatIndex: number
    runnerIndex: number
    playIndex: number | null

    runnerId: number
    responsiblePitcherId: number | null

    event: string | null
    eventType: string | null
    movementReason: string | null

    originBase: string | null
    startBase: string | null
    endBase: string | null
    outBase: string | null

    isOut: boolean
    outNumber: number | null
    isScoringEvent: boolean
    rbi: number
    earned: boolean
    teamUnearned: boolean
}
```

Each runner movement represents a single baserunner's outcome during a plate appearance.

---

## `FieldingCredit`

Represents a defensive credit assigned during a runner movement.

```ts
interface FieldingCredit {
    gamePk: number
    atBatIndex: number
    runnerIndex: number
    creditIndex: number
    playerId: number
    credit: string
    positionCode: string | null
    positionName: string | null
    positionType: string | null
    positionAbbreviation: string | null
}
```

Each runner movement may contain zero or more defensive credits.

Typical credits include putouts, assists, errors, and other official defensive scoring.

---

## `FieldingCreditRow`

Internal database representation of a stored fielding credit.

```ts
interface FieldingCreditRow {
    gamePk: number
    atBatIndex: number
    runnerIndex: number
    creditIndex: number
    playerId: number
    credit: string
    positionCode: string | null
    positionName: string | null
    positionType: string | null
    positionAbbreviation: string | null
}
```

---

## `DefensiveEvent`

Represents lineup assignments and defensive changes during a game.

```ts
interface DefensiveEvent {
    gamePk: number
    atBatIndex: number
    eventIndex: number
    teamId: number
    playerId: number
    eventType:
        | "starting_assignment"
        | "defensive_substitution"
        | "position_switch"
        | "pitching_change"
        | "removal"
    fromPosition:
        | "P"
        | "C"
        | "1B"
        | "2B"
        | "3B"
        | "SS"
        | "LF"
        | "CF"
        | "RF"
        | "DH"
        | null
    toPosition:
        | "P"
        | "C"
        | "1B"
        | "2B"
        | "3B"
        | "SS"
        | "LF"
        | "CF"
        | "RF"
        | "DH"
        | null
}
```

Defensive events capture starting defensive assignments, substitutions, position switches, pitching changes, and player removals.

---

## `StatExport`

Returned by `queries.getStatExport()`.

This interface contains every normalized record covering the requested date range.

```ts
interface StatExport {
    games: GameDate[]
    appearances: PlayerAppearance[]
    plateAppearances: PlateAppearance[]
    pitches: Pitch[]
    runnerMovements: RunnerMovement[]
    fieldingCredits: FieldingCredit[]
    defensiveEvents: DefensiveEvent[]
}
```

| Property | Description |
|---|---|
| `games` | Downloaded games included in the export. |
| `appearances` | Every player appearance. |
| `plateAppearances` | Every plate appearance. |
| `pitches` | Every recorded pitch. |
| `runnerMovements` | Every baserunner movement. |
| `fieldingCredits` | Every defensive credit. |
| `defensiveEvents` | Every defensive lineup event. |

`StatExport` is intended for analytics, simulations, historical research, machine learning, and any workflow that benefits from processing many games at once.

---


# Database Schema

The SQLite database stores both the original MLB game feeds and a normalized relational schema for fast analytical queries.

## `games`

Stores the complete MLB game feed exactly as returned by the MLB Stats API.

| Column | Type | Description |
|---|---|---|
| `game_pk` | INTEGER | Primary key. MLB game identifier. |
| `data` | TEXT | Complete MLB game feed JSON. |
| `game_date` | TEXT | Generated from the game feed. |
| `abstract_game_state` | TEXT | Generated game status. |
| `coded_game_state` | TEXT | Generated MLB status code. |
| `detailed_state` | TEXT | Generated detailed status. |
| `status_code` | TEXT | Generated MLB status code. |

Indexes:

- `idx_games_game_date`
- `idx_games_status`
- `idx_games_date_completed`

---

## `schedules`

Stores one official schedule for each downloaded season.

| Column | Type |
|---|---|
| `season` | INTEGER |
| `data` | TEXT |
| `downloaded_at` | TEXT |

---

## `player_appearances`

One row for every player appearing in a game.

| Column |
|---|
| `game_pk` |
| `player_id` |
| `team_id` |
| `appeared_as_batter` |
| `appeared_as_pitcher` |
| `appeared_as_runner` |
| `appeared_as_fielder` |
| `started_as_batter` |
| `started_as_pitcher` |
| `started_as_fielder` |

Indexes:

- `idx_player_appearances_player`
- `idx_player_appearances_team`

---

## `plate_appearances`

One row for every plate appearance.

| Column |
|---|
| `game_pk` |
| `at_bat_index` |
| `inning` |
| `half_inning` |
| `is_top_inning` |
| `batter_id` |
| `pitcher_id` |
| `bat_side_code` |
| `pitch_hand_code` |
| `result_type` |
| `event` |
| `event_type` |
| `description` |
| `rbi` |
| `away_score` |
| `home_score` |
| `balls` |
| `strikes` |
| `outs` |
| `start_time` |
| `end_time` |
| `is_complete` |

Indexes:

- `idx_plate_appearances_batter`
- `idx_plate_appearances_pitcher`

---

## `pitches`

One row for every recorded pitch.

The table contains pitch sequencing, pitch tracking, Statcast measurements, pitch movement, strike zone location, and batted-ball data when available.

Primary key:

```text
(game_pk, at_bat_index, event_index)
```

Indexes:

- `idx_pitches_game`

---

## `runner_movements`

One row for every baserunner movement.

| Column |
|---|
| `game_pk` |
| `at_bat_index` |
| `runner_index` |
| `play_index` |
| `runner_id` |
| `responsible_pitcher_id` |
| `event` |
| `event_type` |
| `movement_reason` |
| `origin_base` |
| `start_base` |
| `end_base` |
| `out_base` |
| `is_out` |
| `out_number` |
| `is_scoring_event` |
| `rbi` |
| `earned` |
| `team_unearned` |

Indexes:

- `idx_runner_movements_runner`

---

## `fielding_credits`

One row for every defensive credit assigned to a runner movement.

Primary key:

```text
(game_pk, at_bat_index, runner_index, credit_index)
```

Stored fields:

- player
- defensive credit
- position code
- position name
- position type
- position abbreviation

Indexes:

- `idx_fielding_credits_player`

---

## `defensive_events`

One row for every defensive assignment or defensive change.

Supported event types include:

- starting assignments
- defensive substitutions
- position switches
- pitching changes
- removals

Indexes:

- `idx_defensive_events_player`
- `idx_defensive_events_team`

---

# Complete Example

```ts
import {
    database,
    downloadSeason,
    queries
} from "baseball-database"

import type {
    Game,
    Pitch,
    StatExport
} from "baseball-database"

await downloadSeason(2025)

const game: Game | undefined = queries.getGame(777858)

const exportData: StatExport = queries.getStatExport(
    "2025-04-01",
    "2025-04-30"
)

const pitches: Pitch[] = database
    .prepare(`
        SELECT *
        FROM pitches
        WHERE game_pk = ?
        ORDER BY at_bat_index, event_index
    `)
    .all(777858) as Pitch[]

console.log(game?.gamePk)
console.log(exportData.plateAppearances.length)
console.log(pitches.length)
```

This example downloads a season, retrieves a complete game feed, exports normalized relational data for a date range, and executes a custom SQL query against the underlying SQLite database.