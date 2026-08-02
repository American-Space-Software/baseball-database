class StatExportService {
    gameRepository;
    playerAppearanceRepository;
    plateAppearanceRepository;
    pitchRepository;
    runnerMovementRepository;
    fieldingCreditRepository;
    defensiveEventRepository;
    constructor(gameRepository, playerAppearanceRepository, plateAppearanceRepository, pitchRepository, runnerMovementRepository, fieldingCreditRepository, defensiveEventRepository) {
        this.gameRepository = gameRepository;
        this.playerAppearanceRepository = playerAppearanceRepository;
        this.plateAppearanceRepository = plateAppearanceRepository;
        this.pitchRepository = pitchRepository;
        this.runnerMovementRepository = runnerMovementRepository;
        this.fieldingCreditRepository = fieldingCreditRepository;
        this.defensiveEventRepository = defensiveEventRepository;
    }
    getByDateRange(startDate, endDate) {
        return {
            games: this.gameRepository.getGameDatesByDateRange(startDate, endDate),
            appearances: this.playerAppearanceRepository.getByDateRange(startDate, endDate),
            plateAppearances: this.plateAppearanceRepository.getByDateRange(startDate, endDate),
            pitches: this.pitchRepository.getByDateRange(startDate, endDate),
            runnerMovements: this.runnerMovementRepository.getByDateRange(startDate, endDate),
            fieldingCredits: this.fieldingCreditRepository.getByDateRange(startDate, endDate),
            defensiveEvents: this.defensiveEventRepository.getByDateRange(startDate, endDate)
        };
    }
}
export { StatExportService };
//# sourceMappingURL=stat-export-service.js.map