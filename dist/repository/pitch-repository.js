class PitchRepository {
    database;
    constructor(database) {
        this.database = database;
    }
    get(gamePk, atBatIndex, eventIndex) {
        const row = this.database.prepare(`
            SELECT
                game_pk AS gamePk,
                at_bat_index AS atBatIndex,
                event_index AS eventIndex,
                (
                    SELECT plateAppearance.batter_id
                    FROM plate_appearances plateAppearance
                    WHERE plateAppearance.game_pk = pitches.game_pk
                        AND plateAppearance.at_bat_index = pitches.at_bat_index
                ) AS batterId,
                (
                    SELECT plateAppearance.pitcher_id
                    FROM plate_appearances plateAppearance
                    WHERE plateAppearance.game_pk = pitches.game_pk
                        AND plateAppearance.at_bat_index = pitches.at_bat_index
                ) AS pitcherId,
                play_id AS playId,
                pitch_number AS pitchNumber,
                start_time AS startTime,
                end_time AS endTime,

                description,
                code,
                pitch_type_code AS pitchTypeCode,
                pitch_type_description AS pitchTypeDescription,
                call_code AS callCode,
                call_description AS callDescription,

                is_in_play AS isInPlay,
                is_strike AS isStrike,
                is_ball AS isBall,
                is_scoring_play AS isScoringPlay,
                has_review AS hasReview,

                balls,
                strikes,
                outs,

                start_speed AS startSpeed,
                end_speed AS endSpeed,
                strike_zone_top AS strikeZoneTop,
                strike_zone_bottom AS strikeZoneBottom,
                zone,
                type_confidence AS typeConfidence,
                plate_time AS plateTime,
                extension,

                coordinate_a_x AS coordinateAX,
                coordinate_a_y AS coordinateAY,
                coordinate_a_z AS coordinateAZ,
                coordinate_pfx_x AS coordinatePfxX,
                coordinate_pfx_z AS coordinatePfxZ,
                coordinate_p_x AS coordinatePX,
                coordinate_p_z AS coordinatePZ,
                coordinate_v_x_0 AS coordinateVX0,
                coordinate_v_y_0 AS coordinateVY0,
                coordinate_v_z_0 AS coordinateVZ0,
                coordinate_x AS coordinateX,
                coordinate_x_0 AS coordinateX0,
                coordinate_y AS coordinateY,
                coordinate_y_0 AS coordinateY0,
                coordinate_z_0 AS coordinateZ0,

                break_angle AS breakAngle,
                break_length AS breakLength,
                break_y AS breakY,
                break_vertical AS breakVertical,
                break_vertical_induced AS breakVerticalInduced,
                break_horizontal AS breakHorizontal,
                spin_rate AS spinRate,
                spin_direction AS spinDirection,

                launch_speed AS launchSpeed,
                launch_angle AS launchAngle,
                total_distance AS totalDistance,
                trajectory,
                hardness,
                hit_location AS hitLocation,
                hit_coordinate_x AS hitCoordinateX,
                hit_coordinate_y AS hitCoordinateY
            FROM pitches
            WHERE game_pk = ?
                AND at_bat_index = ?
                AND event_index = ?
        `).get(gamePk, atBatIndex, eventIndex);
        return row
            ? this.mapRow(row)
            : undefined;
    }
    getByPlateAppearance(gamePk, atBatIndex) {
        const rows = this.database.prepare(`
            SELECT
                game_pk AS gamePk,
                at_bat_index AS atBatIndex,
                event_index AS eventIndex,
                (
                    SELECT plateAppearance.batter_id
                    FROM plate_appearances plateAppearance
                    WHERE plateAppearance.game_pk = pitches.game_pk
                        AND plateAppearance.at_bat_index = pitches.at_bat_index
                ) AS batterId,
                (
                    SELECT plateAppearance.pitcher_id
                    FROM plate_appearances plateAppearance
                    WHERE plateAppearance.game_pk = pitches.game_pk
                        AND plateAppearance.at_bat_index = pitches.at_bat_index
                ) AS pitcherId,
                play_id AS playId,
                pitch_number AS pitchNumber,
                start_time AS startTime,
                end_time AS endTime,

                description,
                code,
                pitch_type_code AS pitchTypeCode,
                pitch_type_description AS pitchTypeDescription,
                call_code AS callCode,
                call_description AS callDescription,

                is_in_play AS isInPlay,
                is_strike AS isStrike,
                is_ball AS isBall,
                is_scoring_play AS isScoringPlay,
                has_review AS hasReview,

                balls,
                strikes,
                outs,

                start_speed AS startSpeed,
                end_speed AS endSpeed,
                strike_zone_top AS strikeZoneTop,
                strike_zone_bottom AS strikeZoneBottom,
                zone,
                type_confidence AS typeConfidence,
                plate_time AS plateTime,
                extension,

                coordinate_a_x AS coordinateAX,
                coordinate_a_y AS coordinateAY,
                coordinate_a_z AS coordinateAZ,
                coordinate_pfx_x AS coordinatePfxX,
                coordinate_pfx_z AS coordinatePfxZ,
                coordinate_p_x AS coordinatePX,
                coordinate_p_z AS coordinatePZ,
                coordinate_v_x_0 AS coordinateVX0,
                coordinate_v_y_0 AS coordinateVY0,
                coordinate_v_z_0 AS coordinateVZ0,
                coordinate_x AS coordinateX,
                coordinate_x_0 AS coordinateX0,
                coordinate_y AS coordinateY,
                coordinate_y_0 AS coordinateY0,
                coordinate_z_0 AS coordinateZ0,

                break_angle AS breakAngle,
                break_length AS breakLength,
                break_y AS breakY,
                break_vertical AS breakVertical,
                break_vertical_induced AS breakVerticalInduced,
                break_horizontal AS breakHorizontal,
                spin_rate AS spinRate,
                spin_direction AS spinDirection,

                launch_speed AS launchSpeed,
                launch_angle AS launchAngle,
                total_distance AS totalDistance,
                trajectory,
                hardness,
                hit_location AS hitLocation,
                hit_coordinate_x AS hitCoordinateX,
                hit_coordinate_y AS hitCoordinateY
            FROM pitches
            WHERE game_pk = ?
                AND at_bat_index = ?
            ORDER BY event_index
        `).all(gamePk, atBatIndex);
        return rows.map(row => this.mapRow(row));
    }
    getByGame(gamePk) {
        const rows = this.database.prepare(`
            SELECT
                game_pk AS gamePk,
                at_bat_index AS atBatIndex,
                event_index AS eventIndex,
                (
                    SELECT plateAppearance.batter_id
                    FROM plate_appearances plateAppearance
                    WHERE plateAppearance.game_pk = pitches.game_pk
                        AND plateAppearance.at_bat_index = pitches.at_bat_index
                ) AS batterId,
                (
                    SELECT plateAppearance.pitcher_id
                    FROM plate_appearances plateAppearance
                    WHERE plateAppearance.game_pk = pitches.game_pk
                        AND plateAppearance.at_bat_index = pitches.at_bat_index
                ) AS pitcherId,
                play_id AS playId,
                pitch_number AS pitchNumber,
                start_time AS startTime,
                end_time AS endTime,

                description,
                code,
                pitch_type_code AS pitchTypeCode,
                pitch_type_description AS pitchTypeDescription,
                call_code AS callCode,
                call_description AS callDescription,

                is_in_play AS isInPlay,
                is_strike AS isStrike,
                is_ball AS isBall,
                is_scoring_play AS isScoringPlay,
                has_review AS hasReview,

                balls,
                strikes,
                outs,

                start_speed AS startSpeed,
                end_speed AS endSpeed,
                strike_zone_top AS strikeZoneTop,
                strike_zone_bottom AS strikeZoneBottom,
                zone,
                type_confidence AS typeConfidence,
                plate_time AS plateTime,
                extension,

                coordinate_a_x AS coordinateAX,
                coordinate_a_y AS coordinateAY,
                coordinate_a_z AS coordinateAZ,
                coordinate_pfx_x AS coordinatePfxX,
                coordinate_pfx_z AS coordinatePfxZ,
                coordinate_p_x AS coordinatePX,
                coordinate_p_z AS coordinatePZ,
                coordinate_v_x_0 AS coordinateVX0,
                coordinate_v_y_0 AS coordinateVY0,
                coordinate_v_z_0 AS coordinateVZ0,
                coordinate_x AS coordinateX,
                coordinate_x_0 AS coordinateX0,
                coordinate_y AS coordinateY,
                coordinate_y_0 AS coordinateY0,
                coordinate_z_0 AS coordinateZ0,

                break_angle AS breakAngle,
                break_length AS breakLength,
                break_y AS breakY,
                break_vertical AS breakVertical,
                break_vertical_induced AS breakVerticalInduced,
                break_horizontal AS breakHorizontal,
                spin_rate AS spinRate,
                spin_direction AS spinDirection,

                launch_speed AS launchSpeed,
                launch_angle AS launchAngle,
                total_distance AS totalDistance,
                trajectory,
                hardness,
                hit_location AS hitLocation,
                hit_coordinate_x AS hitCoordinateX,
                hit_coordinate_y AS hitCoordinateY
            FROM pitches
            WHERE game_pk = ?
            ORDER BY at_bat_index, event_index
        `).all(gamePk);
        return rows.map(row => this.mapRow(row));
    }
    getByDateRange(startDate, endDate) {
        const rows = this.database.prepare(`
            SELECT
                pitch.game_pk AS gamePk,
                pitch.at_bat_index AS atBatIndex,
                pitch.event_index AS eventIndex,
                plateAppearance.batter_id AS batterId,
                plateAppearance.pitcher_id AS pitcherId,
                pitch.play_id AS playId,
                pitch.pitch_number AS pitchNumber,
                pitch.start_time AS startTime,
                pitch.end_time AS endTime,

                pitch.description,
                pitch.code,
                pitch.pitch_type_code AS pitchTypeCode,
                pitch.pitch_type_description AS pitchTypeDescription,
                pitch.call_code AS callCode,
                pitch.call_description AS callDescription,

                pitch.is_in_play AS isInPlay,
                pitch.is_strike AS isStrike,
                pitch.is_ball AS isBall,
                pitch.is_scoring_play AS isScoringPlay,
                pitch.has_review AS hasReview,

                pitch.balls,
                pitch.strikes,
                pitch.outs,

                pitch.start_speed AS startSpeed,
                pitch.end_speed AS endSpeed,
                pitch.strike_zone_top AS strikeZoneTop,
                pitch.strike_zone_bottom AS strikeZoneBottom,
                pitch.zone,
                pitch.type_confidence AS typeConfidence,
                pitch.plate_time AS plateTime,
                pitch.extension,

                pitch.coordinate_a_x AS coordinateAX,
                pitch.coordinate_a_y AS coordinateAY,
                pitch.coordinate_a_z AS coordinateAZ,
                pitch.coordinate_pfx_x AS coordinatePfxX,
                pitch.coordinate_pfx_z AS coordinatePfxZ,
                pitch.coordinate_p_x AS coordinatePX,
                pitch.coordinate_p_z AS coordinatePZ,
                pitch.coordinate_v_x_0 AS coordinateVX0,
                pitch.coordinate_v_y_0 AS coordinateVY0,
                pitch.coordinate_v_z_0 AS coordinateVZ0,
                pitch.coordinate_x AS coordinateX,
                pitch.coordinate_x_0 AS coordinateX0,
                pitch.coordinate_y AS coordinateY,
                pitch.coordinate_y_0 AS coordinateY0,
                pitch.coordinate_z_0 AS coordinateZ0,

                pitch.break_angle AS breakAngle,
                pitch.break_length AS breakLength,
                pitch.break_y AS breakY,
                pitch.break_vertical AS breakVertical,
                pitch.break_vertical_induced AS breakVerticalInduced,
                pitch.break_horizontal AS breakHorizontal,
                pitch.spin_rate AS spinRate,
                pitch.spin_direction AS spinDirection,

                pitch.launch_speed AS launchSpeed,
                pitch.launch_angle AS launchAngle,
                pitch.total_distance AS totalDistance,
                pitch.trajectory,
                pitch.hardness,
                pitch.hit_location AS hitLocation,
                pitch.hit_coordinate_x AS hitCoordinateX,
                pitch.hit_coordinate_y AS hitCoordinateY
            FROM pitches pitch
            JOIN plate_appearances plateAppearance
                ON plateAppearance.game_pk = pitch.game_pk
                AND plateAppearance.at_bat_index = pitch.at_bat_index
            JOIN games game
                ON game.game_pk = pitch.game_pk
            WHERE game.game_date >= ?
                AND game.game_date < ?
            ORDER BY
                game.game_date,
                pitch.game_pk,
                pitch.at_bat_index,
                pitch.event_index
        `).all(startDate, endDate);
        return rows.map(row => this.mapRow(row));
    }
    put(pitch) {
        this.database.prepare(`
            INSERT INTO pitches (
                game_pk,
                at_bat_index,
                event_index,
                play_id,
                pitch_number,
                start_time,
                end_time,

                description,
                code,
                pitch_type_code,
                pitch_type_description,
                call_code,
                call_description,

                is_in_play,
                is_strike,
                is_ball,
                is_scoring_play,
                has_review,

                balls,
                strikes,
                outs,

                start_speed,
                end_speed,
                strike_zone_top,
                strike_zone_bottom,
                zone,
                type_confidence,
                plate_time,
                extension,

                coordinate_a_x,
                coordinate_a_y,
                coordinate_a_z,
                coordinate_pfx_x,
                coordinate_pfx_z,
                coordinate_p_x,
                coordinate_p_z,
                coordinate_v_x_0,
                coordinate_v_y_0,
                coordinate_v_z_0,
                coordinate_x,
                coordinate_x_0,
                coordinate_y,
                coordinate_y_0,
                coordinate_z_0,

                break_angle,
                break_length,
                break_y,
                break_vertical,
                break_vertical_induced,
                break_horizontal,
                spin_rate,
                spin_direction,

                launch_speed,
                launch_angle,
                total_distance,
                trajectory,
                hardness,
                hit_location,
                hit_coordinate_x,
                hit_coordinate_y
            )
            VALUES (
                @gamePk,
                @atBatIndex,
                @eventIndex,
                @playId,
                @pitchNumber,
                @startTime,
                @endTime,

                @description,
                @code,
                @pitchTypeCode,
                @pitchTypeDescription,
                @callCode,
                @callDescription,

                @isInPlay,
                @isStrike,
                @isBall,
                @isScoringPlay,
                @hasReview,

                @balls,
                @strikes,
                @outs,

                @startSpeed,
                @endSpeed,
                @strikeZoneTop,
                @strikeZoneBottom,
                @zone,
                @typeConfidence,
                @plateTime,
                @extension,

                @coordinateAX,
                @coordinateAY,
                @coordinateAZ,
                @coordinatePfxX,
                @coordinatePfxZ,
                @coordinatePX,
                @coordinatePZ,
                @coordinateVX0,
                @coordinateVY0,
                @coordinateVZ0,
                @coordinateX,
                @coordinateX0,
                @coordinateY,
                @coordinateY0,
                @coordinateZ0,

                @breakAngle,
                @breakLength,
                @breakY,
                @breakVertical,
                @breakVerticalInduced,
                @breakHorizontal,
                @spinRate,
                @spinDirection,

                @launchSpeed,
                @launchAngle,
                @totalDistance,
                @trajectory,
                @hardness,
                @hitLocation,
                @hitCoordinateX,
                @hitCoordinateY
            )
            ON CONFLICT(game_pk, at_bat_index, event_index) DO UPDATE SET
                play_id = excluded.play_id,
                pitch_number = excluded.pitch_number,
                start_time = excluded.start_time,
                end_time = excluded.end_time,

                description = excluded.description,
                code = excluded.code,
                pitch_type_code = excluded.pitch_type_code,
                pitch_type_description = excluded.pitch_type_description,
                call_code = excluded.call_code,
                call_description = excluded.call_description,

                is_in_play = excluded.is_in_play,
                is_strike = excluded.is_strike,
                is_ball = excluded.is_ball,
                is_scoring_play = excluded.is_scoring_play,
                has_review = excluded.has_review,

                balls = excluded.balls,
                strikes = excluded.strikes,
                outs = excluded.outs,

                start_speed = excluded.start_speed,
                end_speed = excluded.end_speed,
                strike_zone_top = excluded.strike_zone_top,
                strike_zone_bottom = excluded.strike_zone_bottom,
                zone = excluded.zone,
                type_confidence = excluded.type_confidence,
                plate_time = excluded.plate_time,
                extension = excluded.extension,

                coordinate_a_x = excluded.coordinate_a_x,
                coordinate_a_y = excluded.coordinate_a_y,
                coordinate_a_z = excluded.coordinate_a_z,
                coordinate_pfx_x = excluded.coordinate_pfx_x,
                coordinate_pfx_z = excluded.coordinate_pfx_z,
                coordinate_p_x = excluded.coordinate_p_x,
                coordinate_p_z = excluded.coordinate_p_z,
                coordinate_v_x_0 = excluded.coordinate_v_x_0,
                coordinate_v_y_0 = excluded.coordinate_v_y_0,
                coordinate_v_z_0 = excluded.coordinate_v_z_0,
                coordinate_x = excluded.coordinate_x,
                coordinate_x_0 = excluded.coordinate_x_0,
                coordinate_y = excluded.coordinate_y,
                coordinate_y_0 = excluded.coordinate_y_0,
                coordinate_z_0 = excluded.coordinate_z_0,

                break_angle = excluded.break_angle,
                break_length = excluded.break_length,
                break_y = excluded.break_y,
                break_vertical = excluded.break_vertical,
                break_vertical_induced = excluded.break_vertical_induced,
                break_horizontal = excluded.break_horizontal,
                spin_rate = excluded.spin_rate,
                spin_direction = excluded.spin_direction,

                launch_speed = excluded.launch_speed,
                launch_angle = excluded.launch_angle,
                total_distance = excluded.total_distance,
                trajectory = excluded.trajectory,
                hardness = excluded.hardness,
                hit_location = excluded.hit_location,
                hit_coordinate_x = excluded.hit_coordinate_x,
                hit_coordinate_y = excluded.hit_coordinate_y
        `).run({
            ...pitch,
            isInPlay: Number(pitch.isInPlay),
            isStrike: Number(pitch.isStrike),
            isBall: Number(pitch.isBall),
            isScoringPlay: Number(pitch.isScoringPlay),
            hasReview: Number(pitch.hasReview)
        });
    }
    deleteByGame(gamePk) {
        this.database.prepare(`
            DELETE FROM pitches
            WHERE game_pk = ?
        `).run(gamePk);
    }
    mapRow(row) {
        return {
            gamePk: row.gamePk,
            atBatIndex: row.atBatIndex,
            eventIndex: row.eventIndex,
            plateAppearanceId: `${row.gamePk}:${row.atBatIndex}`,
            batterId: row.batterId,
            pitcherId: row.pitcherId,
            playId: row.playId,
            pitchNumber: row.pitchNumber,
            startTime: row.startTime,
            endTime: row.endTime,
            description: row.description,
            code: row.code,
            pitchTypeCode: row.pitchTypeCode,
            pitchTypeDescription: row.pitchTypeDescription,
            callCode: row.callCode,
            callDescription: row.callDescription,
            isInPlay: Boolean(row.isInPlay),
            isStrike: Boolean(row.isStrike),
            isBall: Boolean(row.isBall),
            isScoringPlay: Boolean(row.isScoringPlay),
            hasReview: Boolean(row.hasReview),
            balls: row.balls,
            strikes: row.strikes,
            outs: row.outs,
            startSpeed: row.startSpeed,
            endSpeed: row.endSpeed,
            strikeZoneTop: row.strikeZoneTop,
            strikeZoneBottom: row.strikeZoneBottom,
            zone: row.zone,
            typeConfidence: row.typeConfidence,
            plateTime: row.plateTime,
            extension: row.extension,
            coordinateAX: row.coordinateAX,
            coordinateAY: row.coordinateAY,
            coordinateAZ: row.coordinateAZ,
            coordinatePfxX: row.coordinatePfxX,
            coordinatePfxZ: row.coordinatePfxZ,
            coordinatePX: row.coordinatePX,
            coordinatePZ: row.coordinatePZ,
            coordinateVX0: row.coordinateVX0,
            coordinateVY0: row.coordinateVY0,
            coordinateVZ0: row.coordinateVZ0,
            coordinateX: row.coordinateX,
            coordinateX0: row.coordinateX0,
            coordinateY: row.coordinateY,
            coordinateY0: row.coordinateY0,
            coordinateZ0: row.coordinateZ0,
            breakAngle: row.breakAngle,
            breakLength: row.breakLength,
            breakY: row.breakY,
            breakVertical: row.breakVertical,
            breakVerticalInduced: row.breakVerticalInduced,
            breakHorizontal: row.breakHorizontal,
            spinRate: row.spinRate,
            spinDirection: row.spinDirection,
            launchSpeed: row.launchSpeed,
            launchAngle: row.launchAngle,
            totalDistance: row.totalDistance,
            trajectory: row.trajectory,
            hardness: row.hardness,
            hitLocation: row.hitLocation,
            hitCoordinateX: row.hitCoordinateX,
            hitCoordinateY: row.hitCoordinateY
        };
    }
}
export { PitchRepository };
//# sourceMappingURL=pitch-repository.js.map