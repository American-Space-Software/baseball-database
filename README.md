# baseball-database

Download and cache official MLB game data locally.

`baseball-database` handles one of the most tedious parts of building baseball applications: downloading and maintaining a complete local copy of MLB game data. It automatically fetches schedules and game feeds from the MLB Stats API, stores them in a local SQLite database, and provides a simple API for retrieving them.

The package can be used as both a library and a command-line tool.

## Features

- ⚾ Download complete MLB seasons
- 🗓️ Download arbitrary ranges of seasons
- 💾 Cache official MLB schedules and game feeds locally
- 🚀 Automatically skips completed games that have already been downloaded
- 🔄 Automatically refreshes games that are still in progress
- 🔎 Fast game status queries without parsing JSON
- 📦 Simple library API
- 🛠️ Lightweight with no ORM
- 📝 Written in TypeScript with full type definitions

---

# Installation

```bash
npm install baseball-database
```

---

# Command Line

By default, downloaded data is stored in:

```text
data/baseball.sqlite
```

You can override this location using the `BASEBALL_DATABASE_PATH` environment variable:

```bash
export BASEBALL_DATABASE_PATH=/path/to/baseball.sqlite
```

The database is created automatically if it does not already exist.

Download a single season:

```bash
baseball-database 2025
```

Download a range of seasons:

```bash
baseball-database 2023 2025
```

Force a complete re-download:

```bash
baseball-database 2025 --force
```

---

# Quick Start

Download an entire season:

```ts
import { downloadSeason, getGame } from "baseball-database"

await downloadSeason(2025)

const game = getGame(777858)

console.log(game?.gameDate)
console.log(game?.detailedState)
```

Retrieve a game:

```ts
import { getGame } from "baseball-database"

const game = getGame(777858)

console.log(game?.data)
```

Retrieve a season schedule:

```ts
import { getSchedule } from "baseball-database"

const schedule = getSchedule(2025)

console.log(schedule?.data)
```

---

# API

## downloadSeason

Downloads every game for a season.

```ts
await downloadSeason(2025)
```

Force a re-download:

```ts
await downloadSeason(2025, true)
```

Returns a `Set<number>` containing the synchronized game IDs for the season.

Completed games already stored locally are reused automatically. Games that are missing or not yet complete are downloaded.

---

## downloadSeasons

Downloads multiple seasons.

```ts
await downloadSeasons(2023, 2025)
```

Equivalent to:

```ts
await downloadSeason(2023)
await downloadSeason(2024)
await downloadSeason(2025)
```

Returns a `Map<number, Set<number>>` keyed by season.

---

## getGame

Looks up a game by MLB `gamePk`.

```ts
const game = getGame(777858)
```

Returns:

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

The `data` property contains the complete game feed exactly as returned by MLB.

The additional properties expose commonly queried status information directly without requiring applications to parse the JSON response.

Returns `undefined` if the game has not been downloaded.

---

## getSchedule

Returns the downloaded schedule for a season.

```ts
const schedule = getSchedule(2025)
```

Returns:

```ts
interface Schedule {
    season: number
    downloadedAt: string
    data: ScheduleResponse
}
```

Returns `undefined` if the season has not been downloaded.

---

# Development

Run directly from the repository:

```bash
npm run download -- 2025
```

Download a range of seasons:

```bash
npm run download -- 2023 2025
```

Force a complete re-download:

```bash
npm run download -- 2025 --force
```

---

# Data Source

All schedules and game feeds are downloaded from the official MLB Stats API using the excellent `mlb-stats-api` package.

Game data is stored exactly as returned by MLB without modification.

---

# Why?

Many baseball projects eventually need the same foundation:

- Historical game feeds
- Season schedules
- Local caching
- Offline access
- Reproducible analysis

Rather than solving this repeatedly, `baseball-database` provides a lightweight local cache that other applications can build on.

Projects can focus on simulation, analytics, projections, visualization, or machine learning instead of writing download and caching logic.

---

# License

MIT