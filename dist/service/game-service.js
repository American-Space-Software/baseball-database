class GameService {
    schemaService;
    gameRepository;
    playerAppearanceRepository;
    plateAppearanceRepository;
    pitchRepository;
    runnerMovementRepository;
    fieldingCreditRepository;
    defensiveEventRepository;
    playerRepository;
    rosterRepository;
    _gameSyncHooks = [];
    constructor(schemaService, gameRepository, playerAppearanceRepository, plateAppearanceRepository, pitchRepository, runnerMovementRepository, fieldingCreditRepository, defensiveEventRepository, playerRepository, rosterRepository) {
        this.schemaService = schemaService;
        this.gameRepository = gameRepository;
        this.playerAppearanceRepository = playerAppearanceRepository;
        this.plateAppearanceRepository = plateAppearanceRepository;
        this.pitchRepository = pitchRepository;
        this.runnerMovementRepository = runnerMovementRepository;
        this.fieldingCreditRepository = fieldingCreditRepository;
        this.defensiveEventRepository = defensiveEventRepository;
        this.playerRepository = playerRepository;
        this.rosterRepository = rosterRepository;
    }
    set gameSyncHooks(hooks) {
        this._gameSyncHooks = hooks;
    }
    get(gamePk) {
        return this.gameRepository.get(gamePk);
    }
    getCompletedGamePksByDateRange(startDate, endDate) {
        return this.gameRepository.getCompletedGamePksByDateRange(startDate, endDate);
    }
    syncGame(game) {
        this.schemaService.transaction(() => {
            this.gameRepository.put(game);
            this.playerAppearanceRepository.deleteByGame(game.gamePk);
            this.plateAppearanceRepository.deleteByGame(game.gamePk);
            this.pitchRepository.deleteByGame(game.gamePk);
            this.runnerMovementRepository.deleteByGame(game.gamePk);
            this.fieldingCreditRepository.deleteByGame(game.gamePk);
            this.defensiveEventRepository.deleteByGame(game.gamePk);
            this.syncPlayers(game);
            this.syncPlayerAppearances(game);
            this.syncPlateAppearances(game);
            this.syncPitches(game);
            this.syncRunnerMovements(game);
            this.syncFieldingCredits(game);
            this.syncDefensiveEvents(game);
            for (const gameSyncHook of this._gameSyncHooks) {
                gameSyncHook.run(game);
            }
        });
    }
    syncPlayers(game) {
        for (const gamePlayer of Object.values(game.data.gameData.players ?? {})) {
            const player = gamePlayer;
            const playerId = Number(player.id);
            const firstName = player.firstName;
            const lastName = player.lastName;
            if (!Number.isFinite(playerId) || !firstName || !lastName) {
                continue;
            }
            this.playerRepository.put({
                playerId,
                firstName,
                lastName,
                fullName: player.fullName ?? `${firstName} ${lastName}`,
                primaryPosition: player.primaryPosition?.abbreviation ?? null,
                bats: player.batSide?.code ?? null,
                throws: player.pitchHand?.code ?? null,
                birthDate: player.birthDate ?? null,
                birthCity: player.birthCity ?? null,
                birthCountry: player.birthCountry ?? null,
                height: player.height ?? null,
                weight: this.numberOrNull(player.weight),
                mlbDebutDate: player.mlbDebutDate ?? null,
                primaryNumber: player.primaryNumber ?? null,
                nickName: player.nickName ?? null
            });
        }
    }
    syncPlayerAppearances(game) {
        const boxscore = game.data.liveData?.boxscore;
        this.syncTeamPlayerAppearances(game, game.data.gameData.teams.home.id, boxscore?.teams?.home);
        this.syncTeamPlayerAppearances(game, game.data.gameData.teams.away.id, boxscore?.teams?.away);
    }
    syncTeamPlayerAppearances(game, teamId, teamBoxscore) {
        const players = Object.values(teamBoxscore?.players ?? {});
        const startingPitcherId = Number(teamBoxscore?.pitchers?.[0]);
        for (const player of players) {
            const playerId = Number(player?.person?.id);
            if (!Number.isFinite(playerId)) {
                continue;
            }
            const battingStats = player?.stats?.batting ?? {};
            const pitchingStats = player?.stats?.pitching ?? {};
            const fieldingStats = player?.stats?.fielding ?? {};
            const runningStats = player?.stats?.baseRunning ?? player?.stats?.running ?? {};
            const battingOrder = Number(player?.battingOrder);
            const isSubstitute = player?.gameStatus?.isSubstitute === true;
            const appearedAsBatter = this.playerAppearedAsBatter(game, playerId) ||
                Number(battingStats?.plateAppearances ?? 0) > 0 ||
                Number(battingStats?.atBats ?? 0) > 0;
            const appearedAsPitcher = this.playerAppearedAsPitcher(game, playerId) ||
                Number(pitchingStats?.gamesPlayed ?? pitchingStats?.games ?? 0) > 0 ||
                Number(pitchingStats?.numberOfPitches ?? 0) > 0 ||
                Number(pitchingStats?.battersFaced ?? 0) > 0;
            const appearedAsRunner = this.playerAppearedAsRunner(game, playerId) ||
                Number(runningStats?.stolenBases ?? 0) > 0 ||
                Number(runningStats?.caughtStealing ?? 0) > 0;
            const appearedAsFielder = this.playerAppearedAsFielder(game, playerId) ||
                this.hasDefensivePosition(player?.allPositions) ||
                Number(fieldingStats?.gamesPlayed ?? fieldingStats?.games ?? 0) > 0 ||
                Number(fieldingStats?.putOuts ?? fieldingStats?.putouts ?? 0) > 0 ||
                Number(fieldingStats?.assists ?? 0) > 0 ||
                Number(fieldingStats?.errors ?? 0) > 0;
            const startedAsBatter = appearedAsBatter &&
                (Number.isFinite(battingOrder)
                    ? battingOrder % 100 === 0
                    : !isSubstitute);
            const startedAsPitcher = appearedAsPitcher &&
                (Number(pitchingStats?.gamesStarted ?? 0) > 0 ||
                    playerId === startingPitcherId);
            const startedAsFielder = appearedAsFielder &&
                (Number(fieldingStats?.gamesStarted ?? 0) > 0 ||
                    startedAsPitcher);
            if (!appearedAsBatter &&
                !appearedAsPitcher &&
                !appearedAsRunner &&
                !appearedAsFielder &&
                !startedAsBatter &&
                !startedAsPitcher &&
                !startedAsFielder) {
                continue;
            }
            this.playerAppearanceRepository.put({
                gamePk: game.gamePk,
                playerId,
                teamId,
                appearedAsBatter,
                appearedAsPitcher,
                appearedAsRunner,
                appearedAsFielder,
                startedAsBatter,
                startedAsPitcher,
                startedAsFielder
            });
        }
    }
    syncPlateAppearances(game) {
        for (const play of this.getAllPlays(game)) {
            const atBatIndex = Number(play?.atBatIndex ?? play?.about?.atBatIndex);
            const batterId = Number(play?.matchup?.batter?.id);
            const pitcherId = Number(play?.matchup?.pitcher?.id);
            if (!Number.isFinite(atBatIndex) ||
                !Number.isFinite(batterId) ||
                !Number.isFinite(pitcherId)) {
                continue;
            }
            this.plateAppearanceRepository.put({
                gamePk: game.gamePk,
                atBatIndex,
                inning: Number(play?.about?.inning ?? 0),
                halfInning: String(play?.about?.halfInning ?? ""),
                isTopInning: play?.about?.isTopInning === true,
                batterId,
                pitcherId,
                batSideCode: play?.matchup?.batSide?.code ?? null,
                pitchHandCode: play?.matchup?.pitchHand?.code ?? null,
                resultType: play?.result?.type ?? null,
                event: play?.result?.event ?? null,
                eventType: play?.result?.eventType ?? null,
                description: play?.result?.description ?? null,
                rbi: Number(play?.result?.rbi ?? 0),
                awayScore: Number(play?.result?.awayScore ?? 0),
                homeScore: Number(play?.result?.homeScore ?? 0),
                balls: Number(play?.count?.balls ?? 0),
                strikes: Number(play?.count?.strikes ?? 0),
                outs: Number(play?.count?.outs ?? 0),
                startTime: play?.about?.startTime ?? null,
                endTime: play?.about?.endTime ?? null,
                isComplete: play?.about?.isComplete === true
            });
        }
    }
    syncPitches(game) {
        for (const play of this.getAllPlays(game)) {
            const atBatIndex = Number(play?.atBatIndex ?? play?.about?.atBatIndex);
            const batterId = Number(play?.matchup?.batter?.id);
            const pitcherId = Number(play?.matchup?.pitcher?.id);
            if (!Number.isFinite(atBatIndex) ||
                !Number.isFinite(batterId) ||
                !Number.isFinite(pitcherId)) {
                continue;
            }
            for (const [eventIndex, event] of (play?.playEvents ?? []).entries()) {
                if (event?.isPitch !== true) {
                    continue;
                }
                const pitchData = event?.pitchData ?? {};
                const coordinates = pitchData?.coordinates ?? {};
                const breaks = pitchData?.breaks ?? {};
                const hitData = event?.hitData ?? {};
                const hitCoordinates = hitData?.coordinates ?? {};
                const persistedEventIndex = Number(event?.index ?? eventIndex);
                this.pitchRepository.put({
                    gamePk: game.gamePk,
                    atBatIndex,
                    eventIndex: persistedEventIndex,
                    plateAppearanceId: `${game.gamePk}:${atBatIndex}`,
                    batterId,
                    pitcherId,
                    playId: event?.playId ?? null,
                    pitchNumber: this.numberOrNull(event?.pitchNumber),
                    startTime: event?.startTime ?? null,
                    endTime: event?.endTime ?? null,
                    description: event?.details?.description ?? null,
                    code: event?.details?.code ?? null,
                    pitchTypeCode: event?.details?.type?.code ?? null,
                    pitchTypeDescription: event?.details?.type?.description ?? null,
                    callCode: event?.details?.call?.code ?? event?.details?.code ?? null,
                    callDescription: event?.details?.call?.description ?? event?.details?.description ?? null,
                    isInPlay: event?.details?.isInPlay === true,
                    isStrike: event?.details?.isStrike === true,
                    isBall: event?.details?.isBall === true,
                    isScoringPlay: event?.details?.isScoringPlay === true,
                    hasReview: event?.details?.hasReview === true,
                    balls: this.numberOrNull(event?.count?.balls),
                    strikes: this.numberOrNull(event?.count?.strikes),
                    outs: this.numberOrNull(event?.count?.outs),
                    startSpeed: this.numberOrNull(pitchData?.startSpeed),
                    endSpeed: this.numberOrNull(pitchData?.endSpeed),
                    strikeZoneTop: this.numberOrNull(pitchData?.strikeZoneTop),
                    strikeZoneBottom: this.numberOrNull(pitchData?.strikeZoneBottom),
                    zone: this.numberOrNull(pitchData?.zone),
                    typeConfidence: this.numberOrNull(pitchData?.typeConfidence),
                    plateTime: this.numberOrNull(pitchData?.plateTime),
                    extension: this.numberOrNull(pitchData?.extension),
                    coordinateAX: this.numberOrNull(coordinates?.aX),
                    coordinateAY: this.numberOrNull(coordinates?.aY),
                    coordinateAZ: this.numberOrNull(coordinates?.aZ),
                    coordinatePfxX: this.numberOrNull(coordinates?.pfxX),
                    coordinatePfxZ: this.numberOrNull(coordinates?.pfxZ),
                    coordinatePX: this.numberOrNull(coordinates?.pX),
                    coordinatePZ: this.numberOrNull(coordinates?.pZ),
                    coordinateVX0: this.numberOrNull(coordinates?.vX0),
                    coordinateVY0: this.numberOrNull(coordinates?.vY0),
                    coordinateVZ0: this.numberOrNull(coordinates?.vZ0),
                    coordinateX: this.numberOrNull(coordinates?.x),
                    coordinateX0: this.numberOrNull(coordinates?.x0),
                    coordinateY: this.numberOrNull(coordinates?.y),
                    coordinateY0: this.numberOrNull(coordinates?.y0),
                    coordinateZ0: this.numberOrNull(coordinates?.z0),
                    breakAngle: this.numberOrNull(breaks?.breakAngle),
                    breakLength: this.numberOrNull(breaks?.breakLength),
                    breakY: this.numberOrNull(breaks?.breakY),
                    breakVertical: this.numberOrNull(breaks?.breakVertical),
                    breakVerticalInduced: this.numberOrNull(breaks?.breakVerticalInduced),
                    breakHorizontal: this.numberOrNull(breaks?.breakHorizontal),
                    spinRate: this.numberOrNull(breaks?.spinRate),
                    spinDirection: this.numberOrNull(breaks?.spinDirection),
                    launchSpeed: this.numberOrNull(hitData?.launchSpeed),
                    launchAngle: this.numberOrNull(hitData?.launchAngle),
                    totalDistance: this.numberOrNull(hitData?.totalDistance),
                    trajectory: hitData?.trajectory ?? null,
                    hardness: hitData?.hardness ?? null,
                    hitLocation: this.numberOrNull(hitData?.location),
                    hitCoordinateX: this.numberOrNull(hitCoordinates?.coordX),
                    hitCoordinateY: this.numberOrNull(hitCoordinates?.coordY)
                });
            }
        }
    }
    syncRunnerMovements(game) {
        for (const play of this.getAllPlays(game)) {
            const atBatIndex = Number(play?.atBatIndex ?? play?.about?.atBatIndex);
            if (!Number.isFinite(atBatIndex)) {
                continue;
            }
            for (const [runnerIndex, runner] of (play?.runners ?? []).entries()) {
                const runnerId = Number(runner?.details?.runner?.id);
                if (!Number.isFinite(runnerId)) {
                    continue;
                }
                this.runnerMovementRepository.put({
                    gamePk: game.gamePk,
                    atBatIndex,
                    runnerIndex,
                    playIndex: this.numberOrNull(runner?.details?.playIndex),
                    runnerId,
                    responsiblePitcherId: this.numberOrNull(runner?.details?.responsiblePitcher?.id),
                    event: runner?.details?.event ?? null,
                    eventType: runner?.details?.eventType ?? null,
                    movementReason: runner?.details?.movementReason ?? null,
                    originBase: runner?.movement?.originBase ?? null,
                    startBase: runner?.movement?.start ?? null,
                    endBase: runner?.movement?.end ?? null,
                    outBase: runner?.movement?.outBase ?? null,
                    isOut: runner?.movement?.isOut === true,
                    outNumber: this.numberOrNull(runner?.movement?.outNumber),
                    isScoringEvent: runner?.details?.isScoringEvent === true ||
                        runner?.movement?.end === "score",
                    rbi: Number(runner?.details?.rbi ?? 0),
                    earned: runner?.details?.earned === true,
                    teamUnearned: runner?.details?.teamUnearned === true
                });
            }
        }
    }
    syncFieldingCredits(game) {
        for (const play of this.getAllPlays(game)) {
            const atBatIndex = Number(play?.atBatIndex ?? play?.about?.atBatIndex);
            if (!Number.isFinite(atBatIndex)) {
                continue;
            }
            for (const [runnerIndex, runner] of (play?.runners ?? []).entries()) {
                for (const [creditIndex, credit] of (runner?.credits ?? []).entries()) {
                    const playerId = Number(credit?.player?.id);
                    if (!Number.isFinite(playerId) || !credit?.credit) {
                        continue;
                    }
                    this.fieldingCreditRepository.put({
                        gamePk: game.gamePk,
                        atBatIndex,
                        runnerIndex,
                        creditIndex,
                        playerId,
                        credit: String(credit.credit),
                        positionCode: credit?.position?.code ?? null,
                        positionName: credit?.position?.name ?? null,
                        positionType: credit?.position?.type ?? null,
                        positionAbbreviation: credit?.position?.abbreviation ?? null
                    });
                }
            }
        }
    }
    playerAppearedAsBatter(game, playerId) {
        return this.getAllPlays(game).some(play => Number(play?.matchup?.batter?.id) === playerId);
    }
    playerAppearedAsPitcher(game, playerId) {
        return this.getAllPlays(game).some(play => Number(play?.matchup?.pitcher?.id) === playerId);
    }
    playerAppearedAsRunner(game, playerId) {
        return this.getAllPlays(game).some(play => (play?.runners ?? []).some((runner) => Number(runner?.details?.runner?.id) === playerId));
    }
    playerAppearedAsFielder(game, playerId) {
        return this.getAllPlays(game).some(play => (play?.runners ?? []).some((runner) => (runner?.credits ?? []).some((credit) => Number(credit?.player?.id) === playerId &&
            String(credit?.credit ?? "").startsWith("f_"))));
    }
    hasDefensivePosition(positions) {
        if (!Array.isArray(positions)) {
            return false;
        }
        return positions.some(position => [
            "P",
            "C",
            "1B",
            "2B",
            "3B",
            "SS",
            "LF",
            "CF",
            "RF"
        ].includes(String(position?.abbreviation ?? "")));
    }
    numberOrNull(value) {
        if (value === null || value === undefined || value === "") {
            return null;
        }
        const number = Number(value);
        return Number.isFinite(number)
            ? number
            : null;
    }
    getAllPlays(game) {
        return game.data.liveData?.plays?.allPlays ?? [];
    }
    syncDefensiveEvents(game) {
        const boxscore = game.data.liveData?.boxscore;
        this.syncStartingDefensiveAssignments(game, game.data.gameData.teams.home.id, boxscore?.teams?.home);
        this.syncStartingDefensiveAssignments(game, game.data.gameData.teams.away.id, boxscore?.teams?.away);
        for (const play of this.getAllPlays(game)) {
            const atBatIndex = Number(play?.atBatIndex ?? play?.about?.atBatIndex);
            if (!Number.isFinite(atBatIndex)) {
                continue;
            }
            for (const [eventArrayIndex, event] of (play?.playEvents ?? []).entries()) {
                const eventIndex = Number(event?.index ?? eventArrayIndex);
                if (!Number.isFinite(eventIndex)) {
                    continue;
                }
                this.syncDefensiveEvent(game, play, event, atBatIndex, eventIndex);
            }
        }
    }
    syncStartingDefensiveAssignments(game, teamId, teamBoxscore) {
        const players = Object.values(teamBoxscore?.players ?? {});
        const startingPitcherId = Number(teamBoxscore?.pitchers?.[0]);
        for (const player of players) {
            const playerId = Number(player?.person?.id);
            if (!Number.isFinite(playerId)) {
                continue;
            }
            const position = this.getStartingDefensivePosition(player, playerId === startingPitcherId);
            if (!position) {
                continue;
            }
            this.defensiveEventRepository.put({
                gamePk: game.gamePk,
                atBatIndex: -1,
                eventIndex: -1,
                teamId,
                playerId,
                eventType: "starting_assignment",
                fromPosition: null,
                toPosition: position
            });
        }
    }
    syncDefensiveEvent(game, play, event, atBatIndex, eventIndex) {
        const eventType = String(event?.details?.eventType ?? "");
        const description = String(event?.details?.description ?? "");
        const playerId = Number(event?.player?.id ?? event?.details?.player?.id);
        if (!Number.isFinite(playerId)) {
            return;
        }
        const teamId = this.getDefensiveTeamId(game, play);
        const position = this.normalizeDefensivePosition(event?.position?.abbreviation ??
            event?.position?.code ??
            event?.details?.position?.abbreviation ??
            event?.details?.position?.code);
        if (this.isPitchingChange(eventType, description)) {
            this.defensiveEventRepository.put({
                gamePk: game.gamePk,
                atBatIndex,
                eventIndex,
                teamId,
                playerId,
                eventType: "pitching_change",
                fromPosition: null,
                toPosition: "P"
            });
            return;
        }
        if (this.isDefensiveSubstitution(eventType, description)) {
            this.defensiveEventRepository.put({
                gamePk: game.gamePk,
                atBatIndex,
                eventIndex,
                teamId,
                playerId,
                eventType: "defensive_substitution",
                fromPosition: null,
                toPosition: position
            });
            return;
        }
        if (this.isDefensiveSwitch(eventType, description)) {
            this.defensiveEventRepository.put({
                gamePk: game.gamePk,
                atBatIndex,
                eventIndex,
                teamId,
                playerId,
                eventType: "position_switch",
                fromPosition: null,
                toPosition: position
            });
        }
    }
    getStartingDefensivePosition(player, isStartingPitcher) {
        if (isStartingPitcher) {
            return "P";
        }
        const positions = Array.isArray(player?.allPositions)
            ? player.allPositions
            : [];
        for (const position of positions) {
            const normalizedPosition = this.normalizeDefensivePosition(position?.abbreviation ?? position?.code);
            if (normalizedPosition && normalizedPosition !== "DH") {
                return normalizedPosition;
            }
        }
        return null;
    }
    getDefensiveTeamId(game, play) {
        return play?.about?.isTopInning === true
            ? game.data.gameData.teams.home.id
            : game.data.gameData.teams.away.id;
    }
    isPitchingChange(eventType, description) {
        const normalizedEventType = eventType.toLowerCase();
        const normalizedDescription = description.toLowerCase();
        return normalizedEventType === "pitching_substitution" ||
            normalizedEventType === "pitching_change" ||
            normalizedDescription.includes("pitching change") ||
            normalizedDescription.includes("replaces") &&
                normalizedDescription.includes("pitching");
    }
    isDefensiveSubstitution(eventType, description) {
        const normalizedEventType = eventType.toLowerCase();
        const normalizedDescription = description.toLowerCase();
        return normalizedEventType === "defensive_substitution" ||
            normalizedDescription.includes("defensive substitution");
    }
    isDefensiveSwitch(eventType, description) {
        const normalizedEventType = eventType.toLowerCase();
        const normalizedDescription = description.toLowerCase();
        return normalizedEventType === "defensive_switch" ||
            normalizedEventType === "defensive_position_change" ||
            normalizedDescription.includes("defensive switch") ||
            normalizedDescription.includes("remains in the game");
    }
    normalizeDefensivePosition(value) {
        const position = String(value ?? "").toUpperCase();
        switch (position) {
            case "1":
            case "P":
                return "P";
            case "2":
            case "C":
                return "C";
            case "3":
            case "1B":
                return "1B";
            case "4":
            case "2B":
                return "2B";
            case "5":
            case "3B":
                return "3B";
            case "6":
            case "SS":
                return "SS";
            case "7":
            case "LF":
                return "LF";
            case "8":
            case "CF":
                return "CF";
            case "9":
            case "RF":
                return "RF";
            case "10":
            case "DH":
                return "DH";
            default:
                return null;
        }
    }
}
export { GameService };
//# sourceMappingURL=game-service.js.map