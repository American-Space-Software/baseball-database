import type { DefensiveEvent } from "../repository/defensive-event-repository.js"
import { DefensiveEventRepository } from "../repository/defensive-event-repository.js"
import type { FieldingCredit } from "../repository/fielding-credit-repository.js"
import { FieldingCreditRepository } from "../repository/fielding-credit-repository.js"
import { GameDate, GameRepository } from "../repository/game-repository.js"
import type { Pitch } from "../repository/pitch-repository.js"
import { PitchRepository } from "../repository/pitch-repository.js"
import type { PlateAppearance } from "../repository/plate-appearance-repository.js"
import { PlateAppearanceRepository } from "../repository/plate-appearance-repository.js"
import type { PlayerAppearance } from "../repository/player-appearance-repository.js"
import { PlayerAppearanceRepository } from "../repository/player-appearance-repository.js"
import type { RunnerMovement } from "../repository/runner-movement-repository.js"
import { RunnerMovementRepository } from "../repository/runner-movement-repository.js"

interface StatExport {
    games: GameDate[]
    appearances: PlayerAppearance[]
    plateAppearances: PlateAppearance[]
    pitches: Pitch[]
    runnerMovements: RunnerMovement[]
    fieldingCredits: FieldingCredit[]
    defensiveEvents: DefensiveEvent[]
}



class StatExportService {

    public constructor(
        private readonly gameRepository:GameRepository,
        private readonly playerAppearanceRepository: PlayerAppearanceRepository,
        private readonly plateAppearanceRepository: PlateAppearanceRepository,
        private readonly pitchRepository: PitchRepository,
        private readonly runnerMovementRepository: RunnerMovementRepository,
        private readonly fieldingCreditRepository: FieldingCreditRepository,
        private readonly defensiveEventRepository: DefensiveEventRepository
    ) {}

    public getByDateRange(startDate: string, endDate: string): StatExport {
        return {
            games: this.gameRepository.getGameDatesByDateRange(startDate, endDate),
            appearances: this.playerAppearanceRepository.getByDateRange(startDate, endDate),
            plateAppearances: this.plateAppearanceRepository.getByDateRange(startDate, endDate),
            pitches: this.pitchRepository.getByDateRange(startDate, endDate),
            runnerMovements: this.runnerMovementRepository.getByDateRange(startDate, endDate),
            fieldingCredits: this.fieldingCreditRepository.getByDateRange(startDate, endDate),
            defensiveEvents: this.defensiveEventRepository.getByDateRange(startDate, endDate)
        }
    }
}

export {
    StatExportService
}

export type {
    StatExport
}