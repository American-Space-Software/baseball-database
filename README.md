# baseball-database

A lightweight TypeScript library for downloading, caching, and querying official MLB game data locally.

`baseball-database` downloads official MLB schedules and game feeds from the MLB Stats API, stores them in a local SQLite database, and exposes both a simple TypeScript API and the underlying SQLite database for applications that need complete control over their queries.

Whether you're building simulations, projections, fantasy tools, machine learning pipelines, visualization dashboards, or historical research projects, `baseball-database` provides a fast, reproducible local data layer that your application can build upon.

It can be used as either a library inside your own application or as a command-line tool to maintain a complete local MLB database.

---

# Features

- ⚾ Download complete MLB seasons with a single command
- 📅 Download individual seasons or season ranges
- 💾 Cache official MLB schedules and game feeds in SQLite
- 🚀 Incrementally synchronize only games that have changed
- 🔄 Automatically refresh games still in progress
- ⚡ Fast indexed queries for common baseball workflows
- 🗄️ Direct access to the underlying `better-sqlite3` database
- 📦 Simple TypeScript API
- 🛠️ Zero ORM dependencies
- 📝 Full TypeScript type definitions included

---

# Installation

```bash
npm install baseball-database
```

---

# Command Line

By default, the database is stored at:

```text
data/baseball.sqlite
```

To use a different location:

```bash
export BASEBALL_DATABASE_PATH=/path/to/baseball.sqlite
```

The database schema is created automatically on first use.

## Download a season

```bash
baseball-database 2025
```

## Download multiple seasons

```bash
baseball-database 2023 2025
```

Downloads:

- 2023
- 2024
- 2025

## Force a complete re-download

```bash
baseball-database 2025 --force
```

---

# Library Usage

Before querying data, download at least one season into your local database.

## Download a season

```ts
import { downloadSeason } from "baseball-database"

await downloadSeason(2025)
```

Completed games already stored locally are skipped automatically.

---

## Download multiple seasons

```ts
import { downloadSeasons } from "baseball-database"

await downloadSeasons(2023, 2025)
```

---

## Query downloaded data

```ts
import { queries } from "baseball-database"

const game = queries.getGame(777858)
const schedule = queries.getSchedule(2025)

const exportData = queries.getStatExport(
    "2025-04-01",
    "2025-04-30"
)
```

The query API only accesses data already stored in your local database.

---

## Execute custom SQL

For analytical workloads, the initialized SQLite database is also exported.

```ts
import { database } from "baseball-database"

const games = database
    .prepare(`
        SELECT
            game_pk,
            game_date,
            detailed_state
        FROM games
        WHERE game_date BETWEEN ? AND ?
        ORDER BY game_date
    `)
    .all(
        "2025-04-01",
        "2025-04-30"
    )
```

This is the same `better-sqlite3` connection used internally by the library.

---

# API

## `downloadSeason()`

Downloads and synchronizes every game for a season.

```ts
await downloadSeason(2025)
```

Force a complete re-download:

```ts
await downloadSeason(2025, true)
```

Completed games are reused automatically while games that are missing or still in progress are refreshed.

Returns:

```ts
Promise<Set<number>>
```

---

## `downloadSeasons()`

Downloads an inclusive range of seasons.

```ts
await downloadSeasons(2023, 2025)
```

Equivalent to:

```ts
await downloadSeason(2023)
await downloadSeason(2024)
await downloadSeason(2025)
```

Returns:

```ts
Promise<Map<number, Set<number>>>
```

---

## `queries.getGame()`

Returns a previously downloaded MLB game.

```ts
const game = queries.getGame(777858)
```

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

Returns `undefined` if the game has not been downloaded.

---

## `queries.getSchedule()`

Returns a downloaded schedule.

```ts
const schedule = queries.getSchedule(2025)
```

```ts
interface Schedule {
    season: number
    downloadedAt: string
    data: ScheduleResponse
}
```

Returns `undefined` if the season has not been downloaded.

---

## `queries.getStatExport()`

Returns a relational export over a date range.

```ts
const exportData = queries.getStatExport(
    "2025-04-01",
    "2025-04-30"
)
```

This export is intended for simulations, analytics, and machine learning workflows.

---

## `database`

The initialized `better-sqlite3` database connection is exported directly.

```ts
import { database } from "baseball-database"

const rows = database
    .prepare(`
        SELECT *
        FROM pitches
        WHERE pitcher_id = ?
    `)
    .all(694973)
```

Because the raw SQLite connection is exposed, applications can execute arbitrary SQL without waiting for additional helper functions to be added to the library.

---

# Complete Example

```ts
import {
    database,
    downloadSeason,
    queries
} from "baseball-database"

await downloadSeason(2025)

const game = queries.getGame(777858)

const pitches = database
    .prepare(`
        SELECT *
        FROM pitches
        WHERE game_pk = ?
        ORDER BY at_bat_index, event_index
    `)
    .all(777858)
```

---

# Development

Run directly from the repository:

```bash
npm run download -- 2025
```

Download multiple seasons:

```bash
npm run download -- 2023 2025
```

Force a complete re-download:

```bash
npm run download -- 2025 --force
```

---

# Data Source

Schedules and game feeds are downloaded from the official MLB Stats API using the `mlb-stats-api` package.

All schedules and game feeds are stored exactly as returned by MLB without modification.

---

# Built for Analytics

`baseball-database` is designed for both transactional applications and analytical workloads.

Every official MLB schedule and game feed is preserved exactly as returned by the MLB Stats API while commonly queried information is extracted into relational tables for fast indexed access.

The database currently contains:

| Table | Purpose |
| ------- | ------- |
| `games` | Official game feeds with indexed metadata |
| `schedules` | Official schedules by season |
| `player_appearances` | Every player appearance |
| `plate_appearances` | Every plate appearance |
| `pitches` | Every pitch with Statcast measurements |
| `runner_movements` | Every baserunner movement |
| `fielding_credits` | Defensive credits |
| `defensive_events` | Defensive substitutions and position changes |

This schema makes common baseball queries straightforward without repeatedly traversing deeply nested JSON documents.

Because the package exports the underlying SQLite connection, you can either use the provided query helpers or write your own SQL directly against these tables.

---

# Why?

Nearly every baseball project eventually needs the same foundation:

- Historical game feeds
- Official season schedules
- Local caching
- Offline access
- Fast queries
- Reproducible datasets
- Direct SQL access

Rather than implementing download and synchronization logic in every project, `baseball-database` provides a lightweight local data layer that other applications can build upon.

Whether you're building a simulator, projection system, fantasy application, betting model, visualization tool, or research pipeline, `baseball-database` handles the tedious work of keeping official MLB data synchronized so your application can focus on everything built on top of it.

---

# License

MIT