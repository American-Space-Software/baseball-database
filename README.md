# baseball-database

A lightweight TypeScript library for downloading, caching, and querying official MLB game data locally.

`baseball-database` automatically downloads MLB schedules and game feeds from the official MLB Stats API, stores them in a local SQLite database, and exposes a simple API for accessing that data. It is designed to be the foundation for baseball simulations, analytics, projections, machine learning, and historical research.

Use it as a library inside your own applications or as a command-line tool to maintain a complete local MLB database.

---

## Features

- ⚾ Download complete MLB seasons with a single command
- 📅 Download one season or an arbitrary range of seasons
- 💾 Store schedules and game feeds in a local SQLite database
- 🚀 Incremental synchronization that skips completed games already downloaded
- 🔄 Automatically refresh games that are still in progress
- ⚡ Fast indexed lookups by game ID or season
- 🔎 Query game status without parsing large JSON documents
- 📦 Simple synchronous read API
- 🛠️ Zero ORM dependencies
- 📝 Written in TypeScript with full type definitions

---

# Installation

```bash
npm install baseball-database
```

---

# Command Line

By default the database is stored at:

```text
data/baseball.sqlite
```

To use a different location:

```bash
export BASEBALL_DATABASE_PATH=/path/to/baseball.sqlite
```

The database schema is created automatically.

## Download a season

```bash
baseball-database 2025
```

## Download multiple seasons

```bash
baseball-database 2023 2025
```

This downloads:

- 2023
- 2024
- 2025

## Force a complete re-download

```bash
baseball-database 2025 --force
```

---

# Library Usage

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

Equivalent to:

```ts
await downloadSeason(2023)
await downloadSeason(2024)
await downloadSeason(2025)
```

---

## Retrieve a game

```ts
import { getGame } from "baseball-database"

const game = getGame(777858)

console.log(game?.gameDate)
console.log(game?.detailedState)
console.log(game?.data)
```

---

## Retrieve a season schedule

```ts
import { getSchedule } from "baseball-database"

const schedule = getSchedule(2025)

console.log(schedule?.downloadedAt)
console.log(schedule?.data)
```

---

# API

## `downloadSeason()`

Downloads and synchronizes every game for a season.

```ts
await downloadSeason(2025)
```

Force a full re-download:

```ts
await downloadSeason(2025, true)
```

**Returns**

```ts
Promise<Set<number>>
```

The returned set contains every synchronized MLB `gamePk`.

Games already marked complete are reused automatically. Games that are missing or still in progress are refreshed.

---

## `downloadSeasons()`

Downloads multiple seasons.

```ts
await downloadSeasons(2023, 2025)
```

**Returns**

```ts
Promise<Map<number, Set<number>>>
```

The returned map is keyed by season.

---

## `getGame()`

Returns a previously downloaded MLB game.

```ts
const game = getGame(777858)
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

The `data` property contains the complete official MLB game feed exactly as returned by the MLB Stats API.

The additional fields expose commonly queried status values directly from indexed database columns, allowing applications to determine game state without parsing the JSON feed.

Returns `undefined` if the game has not been downloaded.

---

## `getSchedule()`

Returns the downloaded schedule for a season.

```ts
const schedule = getSchedule(2025)
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

# Database

Schedules and game feeds are stored in a local SQLite database.

The package automatically:

- Creates the database on first use
- Creates the required schema
- Performs incremental synchronization
- Reuses completed games
- Refreshes games that are still in progress

No additional configuration is required beyond choosing the database location if desired.

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

Schedules and game feeds are downloaded from the official MLB Stats API using the excellent `mlb-stats-api` package.

All game feeds are stored exactly as returned by MLB without modification.

---

# Why?

Nearly every baseball project eventually needs the same foundation:

- Historical game feeds
- Official schedules
- Local caching
- Offline access
- Fast queries
- Reproducible datasets

Rather than implementing download and caching logic in every project, `baseball-database` provides a lightweight local data layer that other applications can build upon.

It is intended to serve as the data backbone for simulations, projections, betting models, visualization tools, fantasy applications, and machine learning pipelines.

---

# License

MIT