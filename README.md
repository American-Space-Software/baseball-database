# ⚾ baseball-database

[![npm version](https://img.shields.io/npm/v/baseball-database.svg)](https://www.npmjs.com/package/baseball-database)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)

Download every official MLB game into a local SQLite database with a single command.

`baseball-database` downloads official MLB schedules and game feeds from the MLB Stats API, preserves every response exactly as returned by MLB, and automatically builds a normalized relational database for fast baseball analytics.

Instead of repeatedly downloading game feeds or parsing deeply nested JSON, your application can query pitches, plate appearances, runners, fielders, and games directly using SQL or the included TypeScript API.

It can be used as either:

- 📦 A TypeScript library
- 🖥️ A command-line tool
- 🗄️ A local baseball database for analytics

> **Store every official MLB game exactly once, then query it forever.**

**npm:** https://www.npmjs.com/package/baseball-database

---

# Features

- ⚾ Download complete MLB seasons from the official MLB Stats API
- 📅 Download individual seasons or inclusive season ranges
- 🔄 Incrementally synchronize only games that have changed
- ⏱️ Automatically refresh games that are still in progress
- 💾 Preserve every official schedule and game feed exactly as returned by MLB
- 🗄️ Automatically extract game and player data into a normalized relational schema
- 👤 Maintain normalized player identity, position, handedness, and birth date data
- ⚡ Fast indexed SQLite queries for analytics workloads
- 📦 Simple TypeScript API
- 📝 Full TypeScript type definitions included
- 🚀 Direct access to the underlying `better-sqlite3` database
- 🛠️ Zero ORM dependencies

---

# Quick Start

Install the package:

```bash
npm install baseball-database
```

Download an entire season:

```bash
npx baseball-database 2025
```

Query a downloaded game:

```ts
import { queries } from "baseball-database"

const game = queries.getGame(777858)
```

Or execute SQL directly:

```ts
import { database } from "baseball-database"

const result = database
    .prepare(`
        SELECT COUNT(*) AS pitches
        FROM pitches
    `)
    .get()
```

---

# Architecture

```text
                MLB Stats API
                      │
          schedules + game feeds
                      │
                      ▼
          baseball-database
                      │
      ┌───────────────┴───────────────┐
      ▼                               ▼
 Original JSON                  Relational Tables
      │                               │
      └───────────────┬───────────────┘
                      ▼
             SQLite Database
                      │
         ┌────────────┴────────────┐
         ▼                         ▼
   TypeScript API             Custom SQL
```

The original MLB game feeds are preserved exactly as returned by the API.

To make analytics dramatically faster, commonly queried game, player, appearance, pitch, baserunning, and defensive information is automatically extracted into relational tables while preserving the original JSON as the canonical source of truth.

Applications can choose between:

- Querying raw MLB game feeds
- Using the included TypeScript query helpers
- Writing arbitrary SQL against the normalized database

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

The database schema is created automatically on first use.

> **Note:** If you installed the package locally with `npm install`, invoke the CLI using `npx baseball-database`. If you installed it globally with `npm install -g baseball-database`, you can run `baseball-database` directly.

## Download a season

```bash
npx baseball-database 2025
```

## Download multiple seasons

```bash
npx baseball-database 2023 2025
```

Downloads:

- 2023
- 2024
- 2025

## Force a complete re-download

```bash
npx baseball-database 2025 --force
```

---

# Library Usage

Before querying data, download at least one season into your local database.

## Download a season

```ts
import { downloadSeason } from "baseball-database"

await downloadSeason(2025)
```

Completed games are reused automatically while games that are missing or still in progress are refreshed.

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

The initialized SQLite database is exported directly.

```ts
import { database } from "baseball-database"

const pitches = database
    .prepare(`
        SELECT
            pitcher_id,
            pitch_name,
            AVG(release_speed) AS velocity,
            COUNT(*) AS pitches
        FROM pitches
        GROUP BY pitcher_id, pitch_name
        ORDER BY pitches DESC
    `)
    .all()
```

Applications can execute arbitrary SQL directly against the database without waiting for helper functions to be added to the library.

---

# API

The complete TypeScript API reference is available in [API.md](API.md).

It includes:

- Download functions
- Query helpers
- Database access
- Complete usage examples

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

# Data Integrity

Every official schedule and game feed is stored exactly as returned by MLB.

The normalized tables, including player metadata and game-level analytical tables, are derived from those game feeds to make querying faster, but the original JSON is always preserved and remains the canonical source of truth.

---

# Data Source

Game schedules and live game feeds are downloaded from MLB's public Stats API using the open-source [`mlb-stats-api`](https://github.com/asbeane/mlb-stats-api) Node.js client. This package is **not** developed, maintained, or endorsed by Major League Baseball; it is an independent community project that provides a convenient wrapper around the MLB Stats API.

`baseball-database` stores the responses exactly as they are returned by the MLB Stats API. No game data is modified before being written to the database.

---

# Built for Analytics

The database exposes both the original game feeds and a normalized relational schema.

| Table | Description |
|--------|-------------|
| `games` | Original MLB game feeds with indexed metadata |
| `schedules` | Official schedules by season |
| `players` | Player identity, primary position, handedness, and birth date |
| `player_appearances` | Every player appearance in every game |
| `plate_appearances` | Every plate appearance |
| `pitches` | Every pitch including Statcast measurements |
| `runner_movements` | Every baserunner advancement or out |
| `fielding_credits` | Defensive credits recorded during plays |
| `defensive_events` | Defensive substitutions and position changes |

Player records are populated from the `gameData.players` collection in synchronized MLB game feeds and updated as newer game data is processed.

These tables make common baseball analytics straightforward without repeatedly traversing deeply nested JSON documents.

Because the package exports the underlying SQLite connection, applications can use either the provided query helpers or write their own SQL directly against the database.

---

# Common Uses

`baseball-database` is designed to serve as the data layer for baseball applications including:

- ⚾ Simulations
- 📈 Projection systems
- 🤖 Machine learning datasets
- 🎯 Betting models
- 💰 Fantasy baseball
- 📊 Dashboards
- 🔬 Historical research
- 🧪 Statistical analysis

---

# Why?

Most baseball applications eventually need to solve the same problems:

- Download official schedules
- Download game feeds
- Cache data locally
- Synchronize updates
- Support offline access
- Build reproducible datasets
- Execute fast analytical queries

Rather than rebuilding this infrastructure for every project, `baseball-database` provides a reusable foundation that other baseball software can build upon.

Whether you're building a simulator, projection system, fantasy application, betting model, visualization dashboard, machine learning pipeline, or historical research project, `baseball-database` handles the tedious work of maintaining official MLB data so your application can focus on what makes your application unique.

---

# License

MIT