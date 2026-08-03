import { DefensiveEventRepository } from "../repository/defensive-event-repository.js";
import { FieldingCreditRepository } from "../repository/fielding-credit-repository.js";
import { GameRepository } from "../repository/game-repository.js";
import { StatExport } from "../repository/interfaces.js";
import { PitchRepository } from "../repository/pitch-repository.js";
import { PlateAppearanceRepository } from "../repository/plate-appearance-repository.js";
import { PlayerAppearanceRepository } from "../repository/player-appearance-repository.js";
import { RunnerMovementRepository } from "../repository/runner-movement-repository.js";
declare class StatExportService {
    private readonly gameRepository;
    private readonly playerAppearanceRepository;
    private readonly plateAppearanceRepository;
    private readonly pitchRepository;
    private readonly runnerMovementRepository;
    private readonly fieldingCreditRepository;
    private readonly defensiveEventRepository;
    constructor(gameRepository: GameRepository, playerAppearanceRepository: PlayerAppearanceRepository, plateAppearanceRepository: PlateAppearanceRepository, pitchRepository: PitchRepository, runnerMovementRepository: RunnerMovementRepository, fieldingCreditRepository: FieldingCreditRepository, defensiveEventRepository: DefensiveEventRepository);
    getByDateRange(startDate: string, endDate: string): StatExport;
}
export { StatExportService };
export type { StatExport };
//# sourceMappingURL=stat-export-service.d.ts.map