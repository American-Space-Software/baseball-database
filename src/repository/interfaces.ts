import { GameFeedResponse, ScheduleResponse } from "mlb-stats-api"

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


interface DefensiveEvent {
    gamePk: number
    atBatIndex: number
    eventIndex: number
    teamId: number
    playerId: number
    eventType: "starting_assignment" | "defensive_substitution" | "position_switch" | "pitching_change" | "removal"
    fromPosition: "P" | "C" | "1B" | "2B" | "3B" | "SS" | "LF" | "CF" | "RF" | "DH" | null
    toPosition: "P" | "C" | "1B" | "2B" | "3B" | "SS" | "LF" | "CF" | "RF" | "DH" | null
}



interface Game {
    gamePk: number
    data: GameFeedResponse
    gameDate?: string | null
    abstractGameState?: string | null
    codedGameState?: string | null
    detailedState?: string | null
    statusCode?: string | null
}

interface GameRow {
    gamePk: number
    data: string
    gameDate: string | null
    abstractGameState: string | null
    codedGameState: string | null
    detailedState: string | null
    statusCode: string | null
}


interface GameDate {
    gamePk: number
    gameDate: string
}



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

interface Schedule {
    season: number
    data: ScheduleResponse
    downloadedAt: string
}

interface StatExport {
    games: GameDate[]
    appearances: PlayerAppearance[]
    plateAppearances: PlateAppearance[]
    pitches: Pitch[]
    runnerMovements: RunnerMovement[]
    fieldingCredits: FieldingCredit[]
    defensiveEvents: DefensiveEvent[]
}


export {
    FieldingCredit,
    FieldingCreditRow,
    DefensiveEvent,
    Game,
    GameRow,
    GameDate,
    Pitch,
    PlateAppearance,
    PlayerAppearance,
    RunnerMovement,
    Schedule,
    StatExport
}