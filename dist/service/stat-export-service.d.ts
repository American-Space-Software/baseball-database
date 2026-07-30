import type { DefensiveEvent } from "../repository/defensive-event-repository.js";
import { DefensiveEventRepository } from "../repository/defensive-event-repository.js";
import type { FieldingCredit } from "../repository/fielding-credit-repository.js";
import { FieldingCreditRepository } from "../repository/fielding-credit-repository.js";
import type { Pitch } from "../repository/pitch-repository.js";
import { PitchRepository } from "../repository/pitch-repository.js";
import type { PlateAppearance } from "../repository/plate-appearance-repository.js";
import { PlateAppearanceRepository } from "../repository/plate-appearance-repository.js";
import type { PlayerAppearance } from "../repository/player-appearance-repository.js";
import { PlayerAppearanceRepository } from "../repository/player-appearance-repository.js";
import type { RunnerMovement } from "../repository/runner-movement-repository.js";
import { RunnerMovementRepository } from "../repository/runner-movement-repository.js";
interface StatExport {
    appearances: PlayerAppearance[];
    plateAppearances: PlateAppearance[];
    pitches: Pitch[];
    runnerMovements: RunnerMovement[];
    fieldingCredits: FieldingCredit[];
    defensiveEvents: DefensiveEvent[];
}
declare class StatExportService {
    private readonly playerAppearanceRepository;
    private readonly plateAppearanceRepository;
    private readonly pitchRepository;
    private readonly runnerMovementRepository;
    private readonly fieldingCreditRepository;
    private readonly defensiveEventRepository;
    constructor(playerAppearanceRepository: PlayerAppearanceRepository, plateAppearanceRepository: PlateAppearanceRepository, pitchRepository: PitchRepository, runnerMovementRepository: RunnerMovementRepository, fieldingCreditRepository: FieldingCreditRepository, defensiveEventRepository: DefensiveEventRepository);
    getByDateRange(startDate: string, endDate: string): StatExport;
}
export { StatExportService };
export type { StatExport };
//# sourceMappingURL=stat-export-service.d.ts.map