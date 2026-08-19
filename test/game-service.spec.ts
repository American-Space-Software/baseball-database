import { strict as assert } from "assert"

import { beforeEach, describe, it } from "mocha"

import type { DefensiveEvent } from "../src/repository/defensive-event-repository.js"
import type { FieldingCredit } from "../src/repository/fielding-credit-repository.js"
import type { Game } from "../src/repository/game-repository.js"
import type { Pitch } from "../src/repository/pitch-repository.js"
import type { PlateAppearance } from "../src/repository/plate-appearance-repository.js"
import type { PlayerAppearance } from "../src/repository/player-appearance-repository.js"
import type { Player } from "../src/repository/player-repository.js"
import type { RunnerMovement } from "../src/repository/runner-movement-repository.js"

import { GameService } from "../src/service/game-service.js"
import { SchemaService } from "../src/service/schema-service.js"


class GameRepositoryTestDouble {
    public readonly puts: Game[] = []

    public put(game: Game): void {
        this.puts.push(game)
    }
}

class PlayerRepositoryTestDouble {
    public readonly puts: Player[] = []

    public put(player: Player): void {
        this.puts.push(player)
    }
}

class PlayerAppearanceRepositoryTestDouble {
    public readonly deletedGamePks: number[] = []
    public readonly puts: PlayerAppearance[] = []

    public deleteByGame(gamePk: number): void {
        this.deletedGamePks.push(gamePk)
    }

    public put(playerAppearance: PlayerAppearance): void {
        this.puts.push(playerAppearance)
    }
}

class PlateAppearanceRepositoryTestDouble {
    public readonly deletedGamePks: number[] = []
    public readonly puts: PlateAppearance[] = []

    public deleteByGame(gamePk: number): void {
        this.deletedGamePks.push(gamePk)
    }

    public put(plateAppearance: PlateAppearance): void {
        this.puts.push(plateAppearance)
    }
}

class PitchRepositoryTestDouble {
    public readonly deletedGamePks: number[] = []
    public readonly puts: Pitch[] = []

    public deleteByGame(gamePk: number): void {
        this.deletedGamePks.push(gamePk)
    }

    public put(pitch: Pitch): void {
        this.puts.push(pitch)
    }
}

class RunnerMovementRepositoryTestDouble {
    public readonly deletedGamePks: number[] = []
    public readonly puts: RunnerMovement[] = []

    public deleteByGame(gamePk: number): void {
        this.deletedGamePks.push(gamePk)
    }

    public put(runnerMovement: RunnerMovement): void {
        this.puts.push(runnerMovement)
    }
}

class FieldingCreditRepositoryTestDouble {
    public readonly deletedGamePks: number[] = []
    public readonly puts: FieldingCredit[] = []

    public deleteByGame(gamePk: number): void {
        this.deletedGamePks.push(gamePk)
    }

    public put(fieldingCredit: FieldingCredit): void {
        this.puts.push(fieldingCredit)
    }
}

class DefensiveEventRepositoryTestDouble {
    public readonly deletedGamePks: number[] = []
    public readonly puts: DefensiveEvent[] = []

    public deleteByGame(gamePk: number): void {
        this.deletedGamePks.push(gamePk)
    }

    public put(defensiveEvent: DefensiveEvent): void {
        this.puts.push(defensiveEvent)
    }
}


class GameServiceTestHarness {

    public readonly schemaService: SchemaService
    public readonly gameRepository = new GameRepositoryTestDouble()
    public readonly playerRepository = new PlayerRepositoryTestDouble()
    public readonly playerAppearanceRepository = new PlayerAppearanceRepositoryTestDouble()
    public readonly plateAppearanceRepository = new PlateAppearanceRepositoryTestDouble()
    public readonly pitchRepository = new PitchRepositoryTestDouble()
    public readonly runnerMovementRepository = new RunnerMovementRepositoryTestDouble()
    public readonly fieldingCreditRepository = new FieldingCreditRepositoryTestDouble()
    public readonly defensiveEventRepository = new DefensiveEventRepositoryTestDouble()
    public readonly service: GameService

    public constructor() {
        this.schemaService = new SchemaService(":memory:")
        this.schemaService.load()

        this.service = new GameService(
            this.schemaService,
            this.gameRepository as any,
            this.playerAppearanceRepository as any,
            this.plateAppearanceRepository as any,
            this.pitchRepository as any,
            this.runnerMovementRepository as any,
            this.fieldingCreditRepository as any,
            this.defensiveEventRepository as any,
            this.playerRepository as any
        )
    }

    public buildGame(): Game {
        return {
            gamePk: 123456,
            date: "2026-07-28",
            season: 2026,
            data: {
                gameData: {
                    teams: {
                        away: { id: 10, name: "Away Team" },
                        home: { id: 20, name: "Home Team" }
                    },
                    players: {
                        ID101: {
                            id: 101,
                            firstName: "Away",
                            lastName: "Starter",
                            fullName: "Away Starter",
                            birthDate: "1995-01-01",
                            birthCity: "Away City",
                            birthCountry: "USA",
                            height: "6' 2\"",
                            weight: 205,
                            mlbDebutDate: "2018-04-01",
                            primaryNumber: "10",
                            nickName: "Starter",
                            primaryPosition: { abbreviation: "CF" },
                            batSide: { code: "R" },
                            pitchHand: { code: "R" }
                        },
                        ID102: {
                            id: 102,
                            firstName: "Away",
                            lastName: "Substitute",
                            birthDate: "1996-02-02",
                            primaryPosition: { abbreviation: "LF" },
                            batSide: { code: "L" },
                            pitchHand: { code: "R" }
                        },
                        ID201: {
                            id: 201,
                            firstName: "Away",
                            lastName: "Starting Pitcher",
                            birthDate: "1990-03-03",
                            primaryPosition: { abbreviation: "P" },
                            batSide: { code: "R" },
                            pitchHand: { code: "R" }
                        },
                        ID202: {
                            id: 202,
                            firstName: "Away",
                            lastName: "Relief Pitcher",
                            birthDate: "1992-04-04",
                            primaryPosition: { abbreviation: "P" },
                            batSide: { code: "R" },
                            pitchHand: { code: "L" }
                        },
                        ID301: {
                            id: 301,
                            firstName: "Home",
                            lastName: "Starter",
                            birthDate: "1994-05-05",
                            primaryPosition: { abbreviation: "C" },
                            batSide: { code: "S" },
                            pitchHand: { code: "R" }
                        },
                        ID401: {
                            id: 401,
                            firstName: "Home",
                            lastName: "Starting Pitcher",
                            birthDate: "1989-06-06",
                            primaryPosition: { abbreviation: "P" },
                            batSide: { code: "L" },
                            pitchHand: { code: "L" }
                        }
                    }
                },
                liveData: {
                    boxscore: {
                        teams: {
                            away: {
                                team: { id: 10 },
                                batters: [101, 102],
                                pitchers: [201, 202],
                                players: {
                                    ID101: {
                                        person: { id: 101, fullName: "Away Starter" },
                                        battingOrder: "100",
                                        position: { code: "8", name: "Center Field", type: "Outfielder", abbreviation: "CF" },
                                        allPositions: [{ code: "8", name: "Center Field", type: "Outfielder", abbreviation: "CF" }],
                                        stats: {
                                            batting: { plateAppearances: 1 },
                                            fielding: { gamesStarted: 1 }
                                        }
                                    },
                                    ID102: {
                                        person: { id: 102, fullName: "Away Substitute" },
                                        battingOrder: "101",
                                        position: { code: "11", name: "Pinch Hitter", type: "Hitter", abbreviation: "PH" },
                                        allPositions: [{ code: "11", name: "Pinch Hitter", type: "Hitter", abbreviation: "PH" }],
                                        stats: { batting: { plateAppearances: 1 } }
                                    },
                                    ID201: {
                                        person: { id: 201, fullName: "Away Starting Pitcher" },
                                        position: { code: "1", name: "Pitcher", type: "Pitcher", abbreviation: "P" },
                                        allPositions: [{ code: "1", name: "Pitcher", type: "Pitcher", abbreviation: "P" }],
                                        stats: {
                                            pitching: { gamesPlayed: 1, gamesStarted: 1, battersFaced: 3 },
                                            fielding: { gamesStarted: 1 }
                                        }
                                    },
                                    ID202: {
                                        person: { id: 202, fullName: "Away Relief Pitcher" },
                                        position: { code: "1", name: "Pitcher", type: "Pitcher", abbreviation: "P" },
                                        allPositions: [{ code: "1", name: "Pitcher", type: "Pitcher", abbreviation: "P" }],
                                        stats: { pitching: { gamesPlayed: 1, gamesStarted: 0, battersFaced: 1 } }
                                    }
                                }
                            },
                            home: {
                                team: { id: 20 },
                                batters: [301],
                                pitchers: [401],
                                players: {
                                    ID301: {
                                        person: { id: 301, fullName: "Home Starter" },
                                        battingOrder: "100",
                                        position: { code: "2", name: "Catcher", type: "Catcher", abbreviation: "C" },
                                        allPositions: [{ code: "2", name: "Catcher", type: "Catcher", abbreviation: "C" }],
                                        stats: {
                                            batting: { plateAppearances: 1 },
                                            fielding: { gamesStarted: 1 }
                                        }
                                    },
                                    ID401: {
                                        person: { id: 401, fullName: "Home Starting Pitcher" },
                                        position: { code: "1", name: "Pitcher", type: "Pitcher", abbreviation: "P" },
                                        allPositions: [{ code: "1", name: "Pitcher", type: "Pitcher", abbreviation: "P" }],
                                        stats: {
                                            pitching: { gamesPlayed: 1, gamesStarted: 1, battersFaced: 2 },
                                            fielding: { gamesStarted: 1 }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    plays: { allPlays: [this.buildPlay()] }
                }
            }
        } as Game
    }

    private buildPlay(): any {
        return {
            atBatIndex: 7,
            about: {
                atBatIndex: 7,
                inning: 3,
                halfInning: "top",
                isTopInning: true,
                startTime: "2026-07-28T18:01:00.000Z",
                endTime: "2026-07-28T18:02:00.000Z",
                isComplete: true,
                isScoringPlay: true
            },
            count: { balls: 1, strikes: 2, outs: 1 },
            matchup: {
                batter: { id: 101, fullName: "Away Starter" },
                pitcher: { id: 401, fullName: "Home Starting Pitcher" },
                batSide: { code: "R", description: "Right" },
                pitchHand: { code: "L", description: "Left" }
            },
            result: {
                type: "atBat",
                event: "Single",
                eventType: "single",
                description: "Away Starter singles on a line drive.",
                rbi: 1,
                awayScore: 2,
                homeScore: 1
            },
            playEvents: [
                {
                    index: 0,
                    isPitch: false,
                    type: "pickoff",
                    details: { description: "Pickoff attempt" }
                },
                {
                    index: 1,
                    playId: "pitch-play-id",
                    pitchNumber: 1,
                    startTime: "2026-07-28T18:01:10.000Z",
                    endTime: "2026-07-28T18:01:12.000Z",
                    isPitch: true,
                    type: "pitch",
                    details: {
                        description: "In play, run(s)",
                        code: "D",
                        isInPlay: true,
                        isStrike: false,
                        isBall: false,
                        isScoringPlay: true,
                        hasReview: false,
                        call: { code: "D", description: "In play, run(s)" },
                        type: { code: "FF", description: "Four-Seam Fastball" }
                    },
                    count: { balls: 1, strikes: 2, outs: 1 },
                    pitchData: {
                        startSpeed: 96.2,
                        endSpeed: 88.1,
                        strikeZoneTop: 3.45,
                        strikeZoneBottom: 1.55,
                        zone: 5,
                        typeConfidence: 0.91,
                        plateTime: 0.41,
                        extension: 6.4,
                        coordinates: {
                            aX: 3.1,
                            aY: 25.2,
                            aZ: -31.1,
                            pfxX: 4.4,
                            pfxZ: 9.8,
                            pX: 0.12,
                            pZ: 2.67,
                            vX0: -4.3,
                            vY0: -139.2,
                            vZ0: -3.1,
                            x: 115.4,
                            x0: -1.7,
                            y: 165.2,
                            y0: 50,
                            z0: 5.8
                        },
                        breaks: {
                            breakAngle: 28.1,
                            breakLength: 4.6,
                            breakY: 24,
                            breakVertical: -12.3,
                            breakVerticalInduced: 16.1,
                            breakHorizontal: 5.2,
                            spinRate: 2412,
                            spinDirection: 187
                        }
                    },
                    hitData: {
                        launchSpeed: 102.4,
                        launchAngle: 14,
                        totalDistance: 224,
                        trajectory: "line_drive",
                        hardness: "hard",
                        location: "7",
                        coordinates: { coordX: 72.1, coordY: 103.4 }
                    }
                }
            ],
            runners: [
                {
                    movement: {
                        originBase: "1B",
                        start: "1B",
                        end: "score",
                        outBase: null,
                        isOut: false,
                        outNumber: null
                    },
                    details: {
                        runner: { id: 102, fullName: "Away Substitute" },
                        responsiblePitcher: { id: 401, fullName: "Home Starting Pitcher" },
                        event: "Single",
                        eventType: "single",
                        movementReason: "r_adv_force",
                        playIndex: 1,
                        isScoringEvent: true,
                        rbi: 1,
                        earned: true,
                        teamUnearned: false
                    },
                    credits: [
                        {
                            player: { id: 301, fullName: "Home Starter" },
                            credit: "f_assist",
                            position: { code: "2", name: "Catcher", type: "Catcher", abbreviation: "C" }
                        },
                        {
                            player: { id: 401, fullName: "Home Starting Pitcher" },
                            credit: "f_putout",
                            position: { code: "1", name: "Pitcher", type: "Pitcher", abbreviation: "P" }
                        }
                    ]
                }
            ]
        }
    }
}


describe("GameService", function () {

    let harness: GameServiceTestHarness
    let game: Game

    beforeEach(function () {
        harness = new GameServiceTestHarness()
        game = harness.buildGame()
    })

    it("persists the game and replaces all child records", function () {
        harness.service.syncGame(game)

        assert.deepEqual(harness.gameRepository.puts, [game])
        assert.deepEqual(harness.playerAppearanceRepository.deletedGamePks, [123456])
        assert.deepEqual(harness.plateAppearanceRepository.deletedGamePks, [123456])
        assert.deepEqual(harness.pitchRepository.deletedGamePks, [123456])
        assert.deepEqual(harness.runnerMovementRepository.deletedGamePks, [123456])
        assert.deepEqual(harness.fieldingCreditRepository.deletedGamePks, [123456])
        assert.deepEqual(harness.defensiveEventRepository.deletedGamePks, [123456])
    })

    it("persists players from game data", function () {
        harness.service.syncGame(game)

        assert.equal(harness.playerRepository.puts.length, 6)

        assert.deepEqual(harness.playerRepository.puts[0], {
            playerId: 101,
            firstName: "Away",
            lastName: "Starter",
            fullName: "Away Starter",
            primaryPosition: "CF",
            bats: "R",
            throws: "R",
            birthDate: "1995-01-01",
            birthCity: "Away City",
            birthCountry: "USA",
            height: "6' 2\"",
            weight: 205,
            mlbDebutDate: "2018-04-01",
            primaryNumber: "10",
            nickName: "Starter"
        })

        assert.deepEqual(harness.playerRepository.puts[5], {
            playerId: 401,
            firstName: "Home",
            lastName: "Starting Pitcher",
            fullName: "Home Starting Pitcher",
            primaryPosition: "P",
            bats: "L",
            throws: "L",
            birthDate: "1989-06-06",
            birthCity: null,
            birthCountry: null,
            height: null,
            weight: null,
            mlbDebutDate: null,
            primaryNumber: null,
            nickName: null
        })
    })

    it("persists nullable player metadata", function () {
        ;(game as any).data.gameData.players.ID101.primaryPosition = undefined
        ;(game as any).data.gameData.players.ID101.batSide = undefined
        ;(game as any).data.gameData.players.ID101.pitchHand = undefined
        ;(game as any).data.gameData.players.ID101.birthDate = undefined
        ;(game as any).data.gameData.players.ID101.birthCity = undefined
        ;(game as any).data.gameData.players.ID101.birthCountry = undefined
        ;(game as any).data.gameData.players.ID101.height = undefined
        ;(game as any).data.gameData.players.ID101.weight = undefined
        ;(game as any).data.gameData.players.ID101.mlbDebutDate = undefined
        ;(game as any).data.gameData.players.ID101.primaryNumber = undefined
        ;(game as any).data.gameData.players.ID101.nickName = undefined

        harness.service.syncGame(game)

        assert.deepEqual(harness.playerRepository.puts[0], {
            playerId: 101,
            firstName: "Away",
            lastName: "Starter",
            fullName: "Away Starter",
            primaryPosition: null,
            bats: null,
            throws: null,
            birthDate: null,
            birthCity: null,
            birthCountry: null,
            height: null,
            weight: null,
            mlbDebutDate: null,
            primaryNumber: null,
            nickName: null
        })
    })

    it("skips players without a valid id or name", function () {
        const players = (game as any).data.gameData.players

        players.INVALID_ID = {
            id: "invalid",
            firstName: "Invalid",
            lastName: "Player"
        }

        players.MISSING_FIRST_NAME = {
            id: 999,
            lastName: "Player"
        }

        players.MISSING_LAST_NAME = {
            id: 998,
            firstName: "Player"
        }

        harness.service.syncGame(game)

        assert.equal(harness.playerRepository.puts.length, 6)
        assert.equal(harness.playerRepository.puts.some(player => player.playerId === 999), false)
        assert.equal(harness.playerRepository.puts.some(player => player.playerId === 998), false)
    })

    it("persists the complete plate appearance", function () {
        harness.service.syncGame(game)

        assert.equal(harness.plateAppearanceRepository.puts.length, 1)
        assert.deepEqual(harness.plateAppearanceRepository.puts[0], {
            gamePk: 123456,
            atBatIndex: 7,
            inning: 3,
            halfInning: "top",
            isTopInning: true,
            batterId: 101,
            pitcherId: 401,
            batSideCode: "R",
            pitchHandCode: "L",
            resultType: "atBat",
            event: "Single",
            eventType: "single",
            description: "Away Starter singles on a line drive.",
            rbi: 1,
            awayScore: 2,
            homeScore: 1,
            balls: 1,
            strikes: 2,
            outs: 1,
            startTime: "2026-07-28T18:01:00.000Z",
            endTime: "2026-07-28T18:02:00.000Z",
            isComplete: true
        })
    })

    it("persists only pitch play events", function () {
        harness.service.syncGame(game)

        assert.equal(harness.pitchRepository.puts.length, 1)
        assert.equal(harness.pitchRepository.puts[0].eventIndex, 1)
        assert.equal(harness.pitchRepository.puts[0].playId, "pitch-play-id")
    })

    it("persists all pitch details, measurements, movement, and contact data", function () {
        harness.service.syncGame(game)

        assert.deepEqual(harness.pitchRepository.puts[0], {
            gamePk: 123456,
            atBatIndex: 7,
            eventIndex: 1,
            plateAppearanceId: "123456:7",
            batterId: 101,
            pitcherId: 401,
            playId: "pitch-play-id",
            pitchNumber: 1,
            startTime: "2026-07-28T18:01:10.000Z",
            endTime: "2026-07-28T18:01:12.000Z",
            description: "In play, run(s)",
            code: "D",
            pitchTypeCode: "FF",
            pitchTypeDescription: "Four-Seam Fastball",
            callCode: "D",
            callDescription: "In play, run(s)",
            isInPlay: true,
            isStrike: false,
            isBall: false,
            isScoringPlay: true,
            hasReview: false,
            balls: 1,
            strikes: 2,
            outs: 1,
            startSpeed: 96.2,
            endSpeed: 88.1,
            strikeZoneTop: 3.45,
            strikeZoneBottom: 1.55,
            zone: 5,
            typeConfidence: 0.91,
            plateTime: 0.41,
            extension: 6.4,
            coordinateAX: 3.1,
            coordinateAY: 25.2,
            coordinateAZ: -31.1,
            coordinatePfxX: 4.4,
            coordinatePfxZ: 9.8,
            coordinatePX: 0.12,
            coordinatePZ: 2.67,
            coordinateVX0: -4.3,
            coordinateVY0: -139.2,
            coordinateVZ0: -3.1,
            coordinateX: 115.4,
            coordinateX0: -1.7,
            coordinateY: 165.2,
            coordinateY0: 50,
            coordinateZ0: 5.8,
            breakAngle: 28.1,
            breakLength: 4.6,
            breakY: 24,
            breakVertical: -12.3,
            breakVerticalInduced: 16.1,
            breakHorizontal: 5.2,
            spinRate: 2412,
            spinDirection: 187,
            launchSpeed: 102.4,
            launchAngle: 14,
            totalDistance: 224,
            trajectory: "line_drive",
            hardness: "hard",
            hitLocation: 7,
            hitCoordinateX: 72.1,
            hitCoordinateY: 103.4
        })
    })

    it("persists runner movement using its array index as runnerIndex", function () {
        harness.service.syncGame(game)

        assert.equal(harness.runnerMovementRepository.puts.length, 1)
        assert.deepEqual(harness.runnerMovementRepository.puts[0], {
            gamePk: 123456,
            atBatIndex: 7,
            runnerIndex: 0,
            playIndex: 1,
            runnerId: 102,
            responsiblePitcherId: 401,
            event: "Single",
            eventType: "single",
            movementReason: "r_adv_force",
            originBase: "1B",
            startBase: "1B",
            endBase: "score",
            outBase: null,
            isOut: false,
            outNumber: null,
            isScoringEvent: true,
            rbi: 1,
            earned: true,
            teamUnearned: false
        })
    })

    it("takes the responsible pitcher directly from runner details", function () {
        const play = (game as any).data.liveData.plays.allPlays[0]
        play.runners[0].credits.push({ player: { id: 999 }, credit: "responsiblePitcher" })

        harness.service.syncGame(game)

        assert.equal(harness.runnerMovementRepository.puts[0].responsiblePitcherId, 401)
    })

    it("persists every fielding credit from each runner", function () {
        harness.service.syncGame(game)

        assert.deepEqual(harness.fieldingCreditRepository.puts, [
            {
                gamePk: 123456,
                atBatIndex: 7,
                runnerIndex: 0,
                creditIndex: 0,
                playerId: 301,
                credit: "f_assist",
                positionCode: "2",
                positionName: "Catcher",
                positionType: "Catcher",
                positionAbbreviation: "C"
            },
            {
                gamePk: 123456,
                atBatIndex: 7,
                runnerIndex: 0,
                creditIndex: 1,
                playerId: 401,
                credit: "f_putout",
                positionCode: "1",
                positionName: "Pitcher",
                positionType: "Pitcher",
                positionAbbreviation: "P"
            }
        ])
    })

    it("does not read fielding credits from the play result", function () {
        const play = (game as any).data.liveData.plays.allPlays[0]

        play.result.credits = [{
            player: { id: 999 },
            credit: "incorrect_credit",
            position: { code: "9", name: "Right Field", type: "Outfielder", abbreviation: "RF" }
        }]

        harness.service.syncGame(game)

        assert.equal(harness.fieldingCreditRepository.puts.length, 2)
        assert.equal(harness.fieldingCreditRepository.puts.some(credit => credit.playerId === 999), false)
    })

    it("persists player appearances from boxscore players", function () {
        harness.service.syncGame(game)

        const appearances = harness.playerAppearanceRepository.puts

        assert.equal(appearances.length, 6)
        assert.deepEqual(appearances.find(appearance => appearance.playerId === 101), {
            gamePk: 123456,
            playerId: 101,
            teamId: 10,
            appearedAsBatter: true,
            appearedAsPitcher: false,
            appearedAsRunner: false,
            appearedAsFielder: true,
            startedAsBatter: true,
            startedAsPitcher: false,
            startedAsFielder: true
        })

        assert.deepEqual(appearances.find(appearance => appearance.playerId === 102), {
            gamePk: 123456,
            playerId: 102,
            teamId: 10,
            appearedAsBatter: true,
            appearedAsPitcher: false,
            appearedAsRunner: true,
            appearedAsFielder: false,
            startedAsBatter: false,
            startedAsPitcher: false,
            startedAsFielder: false
        })
    })

    it("identifies the first listed pitcher and gamesStarted pitcher as starters", function () {
        harness.service.syncGame(game)

        const appearances = harness.playerAppearanceRepository.puts

        assert.deepEqual(appearances.find(appearance => appearance.playerId === 201), {
            gamePk: 123456,
            playerId: 201,
            teamId: 10,
            appearedAsBatter: false,
            appearedAsPitcher: true,
            appearedAsRunner: false,
            appearedAsFielder: true,
            startedAsBatter: false,
            startedAsPitcher: true,
            startedAsFielder: true
        })

        assert.deepEqual(appearances.find(appearance => appearance.playerId === 202), {
            gamePk: 123456,
            playerId: 202,
            teamId: 10,
            appearedAsBatter: false,
            appearedAsPitcher: true,
            appearedAsRunner: false,
            appearedAsFielder: true,
            startedAsBatter: false,
            startedAsPitcher: false,
            startedAsFielder: false
        })

        assert.equal(appearances.find(appearance => appearance.playerId === 401)?.startedAsPitcher, true)
    })

    it("recognizes MLB starter batting order values and substitutions", function () {
        harness.service.syncGame(game)

        const starter = harness.playerAppearanceRepository.puts.find(appearance => appearance.playerId === 101)
        const substitute = harness.playerAppearanceRepository.puts.find(appearance => appearance.playerId === 102)

        assert.equal(starter?.startedAsBatter, true)
        assert.equal(substitute?.startedAsBatter, false)
    })

    it("handles a game with no players, boxscore, or plays", function () {
        const emptyGame = {
            gamePk: 654321,
            date: "2026-07-29",
            season: 2026,
            data: {
                gameData: {
                    teams: {
                        away: { id: 30 },
                        home: { id: 40 }
                    },
                    players: {}
                },
                liveData: {}
            }
        } as Game

        harness.service.syncGame(emptyGame)

        assert.deepEqual(harness.gameRepository.puts, [emptyGame])
        assert.deepEqual(harness.playerRepository.puts, [])
        assert.deepEqual(harness.playerAppearanceRepository.puts, [])
        assert.deepEqual(harness.plateAppearanceRepository.puts, [])
        assert.deepEqual(harness.pitchRepository.puts, [])
        assert.deepEqual(harness.runnerMovementRepository.puts, [])
        assert.deepEqual(harness.fieldingCreditRepository.puts, [])
        assert.deepEqual(harness.defensiveEventRepository.puts, [])
    })

    it("replaces existing child data every time the same game is synchronized", function () {
        harness.service.syncGame(game)
        harness.service.syncGame(game)

        assert.deepEqual(harness.playerAppearanceRepository.deletedGamePks, [123456, 123456])
        assert.deepEqual(harness.plateAppearanceRepository.deletedGamePks, [123456, 123456])
        assert.deepEqual(harness.pitchRepository.deletedGamePks, [123456, 123456])
        assert.deepEqual(harness.runnerMovementRepository.deletedGamePks, [123456, 123456])
        assert.deepEqual(harness.fieldingCreditRepository.deletedGamePks, [123456, 123456])
        assert.deepEqual(harness.defensiveEventRepository.deletedGamePks, [123456, 123456])
        assert.equal(harness.playerRepository.puts.length, 12)
    })
})


describe("GameSyncHook", function () {

    let harness: GameServiceTestHarness
    let game: Game

    beforeEach(function () {
        harness = new GameServiceTestHarness()
        game = harness.buildGame()
    })

    it("invokes every registered hook after synchronizing the game", function () {
        const synchronizedGames: Game[] = []

        harness.service.gameSyncHooks = [
            { run(synchronizedGame) { synchronizedGames.push(synchronizedGame) } },
            { run(synchronizedGame) { synchronizedGames.push(synchronizedGame) } }
        ]

        harness.service.syncGame(game)

        assert.deepEqual(synchronizedGames, [game, game])
    })

    it("does nothing when no hooks are registered", function () {
        assert.doesNotThrow(() => harness.service.syncGame(game))
    })

    it("runs hooks every time the game is synchronized", function () {
        let runs = 0

        harness.service.gameSyncHooks = [{ run() { runs++ } }]

        harness.service.syncGame(game)
        harness.service.syncGame(game)

        assert.equal(runs, 2)
    })

    it("runs hooks after the normalized repositories have been synchronized", function () {
        harness.service.gameSyncHooks = [{
            run(synchronizedGame) {
                assert.equal(synchronizedGame, game)
                assert.deepEqual(harness.gameRepository.puts, [game])
                assert.deepEqual(harness.playerAppearanceRepository.deletedGamePks, [game.gamePk])
                assert.deepEqual(harness.plateAppearanceRepository.deletedGamePks, [game.gamePk])
                assert.deepEqual(harness.pitchRepository.deletedGamePks, [game.gamePk])
                assert.deepEqual(harness.runnerMovementRepository.deletedGamePks, [game.gamePk])
                assert.deepEqual(harness.fieldingCreditRepository.deletedGamePks, [game.gamePk])
                assert.deepEqual(harness.defensiveEventRepository.deletedGamePks, [game.gamePk])
                assert.equal(harness.playerRepository.puts.length, 6)
                assert.equal(harness.playerAppearanceRepository.puts.length, 6)
                assert.equal(harness.plateAppearanceRepository.puts.length, 1)
                assert.equal(harness.pitchRepository.puts.length, 1)
                assert.equal(harness.runnerMovementRepository.puts.length, 1)
                assert.equal(harness.fieldingCreditRepository.puts.length, 2)
                assert.ok(harness.defensiveEventRepository.puts.length > 0)
            }
        }]

        harness.service.syncGame(game)
    })

    it("runs hooks in registration order", function () {
        const runs: number[] = []

        harness.service.gameSyncHooks = [
            { run() { runs.push(1) } },
            { run() { runs.push(2) } },
            { run() { runs.push(3) } }
        ]

        harness.service.syncGame(game)

        assert.deepEqual(runs, [1, 2, 3])
    })
})