import type { DefensiveEvent } from "../repository/defensive-event-repository.js"
import { DefensiveEventRepository } from "../repository/defensive-event-repository.js"
import type { FieldingCredit } from "../repository/fielding-credit-repository.js"
import { FieldingCreditRepository } from "../repository/fielding-credit-repository.js"
import {  GameRepository } from "../repository/game-repository.js"
import { GameDate, Pitch, PlateAppearance, PlayerAppearance, RunnerMovement, StatExport } from "../repository/interfaces.js"
import { PitchRepository } from "../repository/pitch-repository.js"
import { PlateAppearanceRepository } from "../repository/plate-appearance-repository.js"
import { PlayerAppearanceRepository } from "../repository/player-appearance-repository.js"
import { RunnerMovementRepository } from "../repository/runner-movement-repository.js"




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