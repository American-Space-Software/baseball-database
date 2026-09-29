import { strict as assert } from "assert"

import { afterEach, beforeEach, describe, it } from "mocha"

import {
    PitchRepository
} from "../src/repository/pitch-repository.js"

import type {
    Pitch
} from "../src/repository/interfaces.js"

import { SchemaService } from "../src/service/schema-service.js"

describe("PitchRepository", function () {

    let schemaService: SchemaService
    let repository: PitchRepository

    beforeEach(function () {
        schemaService = new SchemaService(
            ":memory:"
        )

        const database = schemaService.load()

        repository = new PitchRepository(
            database
        )

        for (const game of [
            {
                gamePk: 123456,
                gameDate: "2026-07-01"
            },
            {
                gamePk: 123457,
                gameDate: "2026-07-02"
            },
            {
                gamePk: 123458,
                gameDate: "2026-07-03"
            }
        ]) {
            database.prepare(`
                INSERT INTO games (
                    game_pk,
                    data,
                    game_type

                )
                VALUES (
                    ?,
                    ?,
                    'R'
                )
            `).run(
                game.gamePk,
                JSON.stringify({
                    gamePk: game.gamePk,
                    gameData: {
                        game: {
                            type: "R"
                        },
                        datetime: {
                            officialDate: game.gameDate
                        }
                    }
                })
            )
        }

        for (const plateAppearance of [
            {
                gamePk: 123456,
                atBatIndex: 0,
                batterId: 100001,
                pitcherId: 200001
            },
            {
                gamePk: 123456,
                atBatIndex: 1,
                batterId: 100002,
                pitcherId: 200002
            },
            {
                gamePk: 123456,
                atBatIndex: 2,
                batterId: 100003,
                pitcherId: 200003
            },
            {
                gamePk: 123457,
                atBatIndex: 0,
                batterId: 100004,
                pitcherId: 200004
            },
            {
                gamePk: 123458,
                atBatIndex: 0,
                batterId: 100005,
                pitcherId: 200005
            }
        ]) {
            database.prepare(`
                INSERT INTO plate_appearances (
                    game_pk,
                    at_bat_index,
                    inning,
                    half_inning,
                    is_top_inning,
                    batter_id,
                    pitcher_id,
                    rbi,
                    away_score,
                    home_score,
                    balls,
                    strikes,
                    outs,
                    is_complete
                )
                VALUES (
                    @gamePk,
                    @atBatIndex,
                    1,
                    'top',
                    1,
                    @batterId,
                    @pitcherId,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    1
                )
            `).run(plateAppearance)
        }
    })

    afterEach(function () {
        schemaService.close()
    })

    it("returns undefined when the pitch does not exist", function () {
        assert.equal(
            repository.get(
                123456,
                0,
                0
            ),
            undefined
        )
    })

    it("stores and retrieves a pitch", function () {
        const pitch = createPitch(
            123456,
            0,
            0,
            1
        )

        repository.put(
            pitch
        )

        assert.deepEqual(
            repository.get(
                pitch.gamePk,
                pitch.atBatIndex,
                pitch.eventIndex
            ),
            pitch
        )
    })

    it("returns the plate appearance, batter, and pitcher identifiers", function () {
        const pitch = createPitch(
            123456,
            1,
            0,
            1
        )

        repository.put(
            pitch
        )

        const storedPitch = repository.get(
            pitch.gamePk,
            pitch.atBatIndex,
            pitch.eventIndex
        )

        assert.equal(
            storedPitch?.plateAppearanceId,
            "123456:1"
        )

        assert.equal(
            storedPitch?.batterId,
            100002
        )

        assert.equal(
            storedPitch?.pitcherId,
            200002
        )
    })

    it("stores nullable pitch fields", function () {
        const pitch: Pitch = {
            ...createPitch(
                123456,
                0,
                0,
                1
            ),
            playId: null,
            pitchNumber: null,
            startTime: null,
            endTime: null,
            description: null,
            code: null,
            pitchTypeCode: null,
            pitchTypeDescription: null,
            callCode: null,
            callDescription: null,
            balls: null,
            strikes: null,
            outs: null,
            startSpeed: null,
            endSpeed: null,
            strikeZoneTop: null,
            strikeZoneBottom: null,
            zone: null,
            typeConfidence: null,
            plateTime: null,
            extension: null,
            coordinateAX: null,
            coordinateAY: null,
            coordinateAZ: null,
            coordinatePfxX: null,
            coordinatePfxZ: null,
            coordinatePX: null,
            coordinatePZ: null,
            coordinateVX0: null,
            coordinateVY0: null,
            coordinateVZ0: null,
            coordinateX: null,
            coordinateX0: null,
            coordinateY: null,
            coordinateY0: null,
            coordinateZ0: null,
            breakAngle: null,
            breakLength: null,
            breakY: null,
            breakVertical: null,
            breakVerticalInduced: null,
            breakHorizontal: null,
            spinRate: null,
            spinDirection: null,
            launchSpeed: null,
            launchAngle: null,
            totalDistance: null,
            trajectory: null,
            hardness: null,
            hitLocation: null,
            hitCoordinateX: null,
            hitCoordinateY: null
        }

        repository.put(
            pitch
        )

        assert.deepEqual(
            repository.get(
                pitch.gamePk,
                pitch.atBatIndex,
                pitch.eventIndex
            ),
            pitch
        )
    })

    it("returns boolean values after retrieval", function () {
        const pitch = {
            ...createPitch(
                123456,
                0,
                0,
                1
            ),
            isInPlay: true,
            isStrike: true,
            isBall: false,
            isScoringPlay: false,
            hasReview: true
        }

        repository.put(
            pitch
        )

        const storedPitch = repository.get(
            pitch.gamePk,
            pitch.atBatIndex,
            pitch.eventIndex
        )

        assert.equal(
            storedPitch?.isInPlay,
            true
        )

        assert.equal(
            storedPitch?.isStrike,
            true
        )

        assert.equal(
            storedPitch?.isBall,
            false
        )

        assert.equal(
            storedPitch?.isScoringPlay,
            false
        )

        assert.equal(
            storedPitch?.hasReview,
            true
        )

        assert.equal(
            typeof storedPitch?.isInPlay,
            "boolean"
        )

        assert.equal(
            typeof storedPitch?.isStrike,
            "boolean"
        )

        assert.equal(
            typeof storedPitch?.isBall,
            "boolean"
        )

        assert.equal(
            typeof storedPitch?.isScoringPlay,
            "boolean"
        )

        assert.equal(
            typeof storedPitch?.hasReview,
            "boolean"
        )
    })

    it("replaces an existing pitch", function () {
        repository.put(
            createPitch(
                123456,
                0,
                0,
                1
            )
        )

        const replacement: Pitch = {
            ...createPitch(
                123456,
                0,
                0,
                1
            ),
            description: "In play, run(s)",
            code: "X",
            pitchTypeCode: "SL",
            pitchTypeDescription: "Slider",
            callCode: "X",
            callDescription: "In play, run(s)",
            isInPlay: true,
            isStrike: true,
            isBall: false,
            isScoringPlay: true,
            hasReview: true,
            balls: 2,
            strikes: 2,
            outs: 1,
            startSpeed: 87.4,
            endSpeed: 80.1,
            zone: 5,
            spinRate: 2498,
            launchSpeed: 105.6,
            launchAngle: 24,
            totalDistance: 412,
            trajectory: "fly_ball",
            hardness: "hard",
            hitLocation: 8,
            hitCoordinateX: 125.4,
            hitCoordinateY: 42.1
        }

        repository.put(
            replacement
        )

        assert.deepEqual(
            repository.get(
                replacement.gamePk,
                replacement.atBatIndex,
                replacement.eventIndex
            ),
            replacement
        )
    })

    it("keeps pitches with different event indexes", function () {
        const firstPitch = createPitch(
            123456,
            0,
            0,
            1
        )

        const secondPitch = createPitch(
            123456,
            0,
            2,
            2
        )

        repository.put(firstPitch)
        repository.put(secondPitch)

        assert.deepEqual(
            repository.getByPlateAppearance(
                123456,
                0
            ),
            [
                firstPitch,
                secondPitch
            ]
        )
    })

    it("returns pitches for a plate appearance ordered by event index", function () {
        const thirdPitch = createPitch(
            123456,
            0,
            4,
            3
        )

        const firstPitch = createPitch(
            123456,
            0,
            0,
            1
        )

        const secondPitch = createPitch(
            123456,
            0,
            2,
            2
        )

        const unrelatedPitch = createPitch(
            123456,
            1,
            0,
            1
        )

        repository.put(thirdPitch)
        repository.put(firstPitch)
        repository.put(secondPitch)
        repository.put(unrelatedPitch)

        assert.deepEqual(
            repository.getByPlateAppearance(
                123456,
                0
            ),
            [
                firstPitch,
                secondPitch,
                thirdPitch
            ]
        )
    })

    it("returns an empty array when a plate appearance has no pitches", function () {
        assert.deepEqual(
            repository.getByPlateAppearance(
                123456,
                0
            ),
            []
        )
    })

    it("returns pitches for a game ordered by plate appearance and event index", function () {
        const fourthPitch = createPitch(
            123456,
            2,
            1,
            2
        )

        const thirdPitch = createPitch(
            123456,
            2,
            0,
            1
        )

        const secondPitch = createPitch(
            123456,
            0,
            3,
            2
        )

        const firstPitch = createPitch(
            123456,
            0,
            0,
            1
        )

        const unrelatedPitch = createPitch(
            123457,
            0,
            0,
            1
        )

        repository.put(fourthPitch)
        repository.put(thirdPitch)
        repository.put(secondPitch)
        repository.put(firstPitch)
        repository.put(unrelatedPitch)

        assert.deepEqual(
            repository.getByGame(
                123456
            ),
            [
                firstPitch,
                secondPitch,
                thirdPitch,
                fourthPitch
            ]
        )
    })

    it("returns an empty array when a game has no pitches", function () {
        assert.deepEqual(
            repository.getByGame(
                123456
            ),
            []
        )
    })

    it("returns pitches within the requested date range", function () {
        const firstPitch = createPitch(
            123456,
            0,
            0,
            1
        )

        const secondPitch = createPitch(
            123457,
            0,
            0,
            1
        )

        const endDatePitch = createPitch(
            123458,
            0,
            0,
            1
        )

        repository.put(firstPitch)
        repository.put(secondPitch)
        repository.put(endDatePitch)

        assert.deepEqual(
            repository.getByDateRange(
                "2026-07-01",
                "2026-07-03"
            ),
            [
                firstPitch,
                secondPitch
            ]
        )
    })

    it("includes the start date and excludes the end date", function () {
        const startDatePitch = createPitch(
            123456,
            0,
            0,
            1
        )

        const endDatePitch = createPitch(
            123457,
            0,
            0,
            1
        )

        repository.put(startDatePitch)
        repository.put(endDatePitch)

        assert.deepEqual(
            repository.getByDateRange(
                "2026-07-01",
                "2026-07-02"
            ),
            [
                startDatePitch
            ]
        )
    })

    it("returns pitches ordered by date, game, plate appearance, and event index", function () {
        const firstPitch = createPitch(
            123456,
            0,
            0,
            1
        )

        const secondPitch = createPitch(
            123456,
            0,
            3,
            2
        )

        const thirdPitch = createPitch(
            123456,
            2,
            0,
            1
        )

        const fourthPitch = createPitch(
            123456,
            2,
            1,
            2
        )

        const fifthPitch = createPitch(
            123457,
            0,
            0,
            1
        )

        repository.put(fifthPitch)
        repository.put(fourthPitch)
        repository.put(thirdPitch)
        repository.put(secondPitch)
        repository.put(firstPitch)

        assert.deepEqual(
            repository.getByDateRange(
                "2026-07-01",
                "2026-07-03"
            ),
            [
                firstPitch,
                secondPitch,
                thirdPitch,
                fourthPitch,
                fifthPitch
            ]
        )
    })

    it("returns an empty array when no pitches are within the requested date range", function () {
        repository.put(
            createPitch(
                123456,
                0,
                0,
                1
            )
        )

        assert.deepEqual(
            repository.getByDateRange(
                "2026-07-02",
                "2026-07-03"
            ),
            []
        )
    })

    it("deletes all pitches for a game", function () {
        const firstPitch = createPitch(
            123456,
            0,
            0,
            1
        )

        const secondPitch = createPitch(
            123456,
            1,
            0,
            1
        )

        const unrelatedPitch = createPitch(
            123457,
            0,
            0,
            1
        )

        repository.put(firstPitch)
        repository.put(secondPitch)
        repository.put(unrelatedPitch)

        repository.deleteByGame(
            123456
        )

        assert.deepEqual(
            repository.getByGame(
                123456
            ),
            []
        )

        assert.deepEqual(
            repository.get(
                unrelatedPitch.gamePk,
                unrelatedPitch.atBatIndex,
                unrelatedPitch.eventIndex
            ),
            unrelatedPitch
        )
    })

    function getPlateAppearance(gamePk: number, atBatIndex: number): { batterId: number, pitcherId: number } {
        const plateAppearances = [
            {
                gamePk: 123456,
                atBatIndex: 0,
                batterId: 100001,
                pitcherId: 200001
            },
            {
                gamePk: 123456,
                atBatIndex: 1,
                batterId: 100002,
                pitcherId: 200002
            },
            {
                gamePk: 123456,
                atBatIndex: 2,
                batterId: 100003,
                pitcherId: 200003
            },
            {
                gamePk: 123457,
                atBatIndex: 0,
                batterId: 100004,
                pitcherId: 200004
            },
            {
                gamePk: 123458,
                atBatIndex: 0,
                batterId: 100005,
                pitcherId: 200005
            }
        ]

        const plateAppearance = plateAppearances.find(candidate => {
            return candidate.gamePk === gamePk && candidate.atBatIndex === atBatIndex
        })

        if (!plateAppearance) {
            throw new Error(`Missing test plate appearance ${gamePk}:${atBatIndex}`)
        }

        return plateAppearance
    }

    function createPitch(
        gamePk: number,
        atBatIndex: number,
        eventIndex: number,
        pitchNumber: number
    ): Pitch {
        const plateAppearance = getPlateAppearance(
            gamePk,
            atBatIndex
        )

        return {
            gamePk,
            atBatIndex,
            eventIndex,
            plateAppearanceId: `${gamePk}:${atBatIndex}`,
            batterId: plateAppearance.batterId,
            pitcherId: plateAppearance.pitcherId,
            playId: `${gamePk}-${atBatIndex}-${eventIndex}`,
            pitchNumber,
            startTime: "2026-07-20T17:05:00.000Z",
            endTime: "2026-07-20T17:05:05.000Z",

            description: "Called Strike",
            code: "C",
            pitchTypeCode: "FF",
            pitchTypeDescription: "Four-Seam Fastball",
            callCode: "C",
            callDescription: "Called Strike",

            isInPlay: false,
            isStrike: true,
            isBall: false,
            isScoringPlay: false,
            hasReview: false,

            balls: 0,
            strikes: 1,
            outs: 0,

            startSpeed: 96.4,
            endSpeed: 88.1,
            strikeZoneTop: 3.42,
            strikeZoneBottom: 1.55,
            zone: 4,
            typeConfidence: 2,
            plateTime: 0.41,
            extension: 6.7,

            coordinateAX: -5.31,
            coordinateAY: 28.14,
            coordinateAZ: -13.72,
            coordinatePfxX: -0.42,
            coordinatePfxZ: 1.31,
            coordinatePX: -0.17,
            coordinatePZ: 2.64,
            coordinateVX0: 5.28,
            coordinateVY0: -140.31,
            coordinateVZ0: -5.82,
            coordinateX: 108.3,
            coordinateX0: -1.91,
            coordinateY: 166.4,
            coordinateY0: 50,
            coordinateZ0: 5.91,

            breakAngle: 31.2,
            breakLength: 4.8,
            breakY: 24,
            breakVertical: -15.4,
            breakVerticalInduced: 16.2,
            breakHorizontal: -5.1,
            spinRate: 2387,
            spinDirection: 208,

            launchSpeed: null,
            launchAngle: null,
            totalDistance: null,
            trajectory: null,
            hardness: null,
            hitLocation: null,
            hitCoordinateX: null,
            hitCoordinateY: null
        }
    }
})