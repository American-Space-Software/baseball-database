import { FieldingCreditRepository } from "../repository/fielding-credit-repository.js";
import { GameRepository } from "../repository/game-repository.js";
import { PitchRepository } from "../repository/pitch-repository.js";
import { PlateAppearanceRepository } from "../repository/plate-appearance-repository.js";
import { PlayerAppearanceRepository } from "../repository/player-appearance-repository.js";
import { RunnerMovementRepository } from "../repository/runner-movement-repository.js";
import { DefensiveEventRepository } from "../repository/defensive-event-repository.js";
import { SchemaService } from "./schema-service.js";
import { Game } from "../repository/interfaces.js";
interface GameSyncHook {
    run(game: Game): void;
}
declare class GameService {
    private readonly schemaService;
    private readonly gameRepository;
    private readonly playerAppearanceRepository;
    private readonly plateAppearanceRepository;
    private readonly pitchRepository;
    private readonly runnerMovementRepository;
    private readonly fieldingCreditRepository;
    private readonly defensiveEventRepository;
    private _gameSyncHooks;
    constructor(schemaService: SchemaService, gameRepository: GameRepository, playerAppearanceRepository: PlayerAppearanceRepository, plateAppearanceRepository: PlateAppearanceRepository, pitchRepository: PitchRepository, runnerMovementRepository: RunnerMovementRepository, fieldingCreditRepository: FieldingCreditRepository, defensiveEventRepository: DefensiveEventRepository);
    set gameSyncHooks(hooks: GameSyncHook[]);
    get(gamePk: number): Game | undefined;
    getCompletedGamePksByDateRange(startDate: string, endDate: string): number[];
    syncGame(game: Game): void;
    private syncPlayerAppearances;
    private syncTeamPlayerAppearances;
    private syncPlateAppearances;
    private syncPitches;
    private syncRunnerMovements;
    private syncFieldingCredits;
    private playerAppearedAsBatter;
    private playerAppearedAsPitcher;
    private playerAppearedAsRunner;
    private playerAppearedAsFielder;
    private hasDefensivePosition;
    private numberOrNull;
    private getAllPlays;
    private syncDefensiveEvents;
    private syncStartingDefensiveAssignments;
    private syncDefensiveEvent;
    private getStartingDefensivePosition;
    private getDefensiveTeamId;
    private isPitchingChange;
    private isDefensiveSubstitution;
    private isDefensiveSwitch;
    private normalizeDefensivePosition;
}
export { GameService, GameSyncHook };
//# sourceMappingURL=game-service.d.ts.map