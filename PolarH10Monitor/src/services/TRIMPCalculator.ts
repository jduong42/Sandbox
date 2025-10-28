import {
  TRIMPParams,
  TrainingSession,
  HeartRateZone,
  ZoneSummary,
} from '../types/training';

/**
 * TRIMP (Training Impulse) Calculator
 * Based on Banister's original formula with modifications for different approaches
 */
export class TRIMPCalculator {
  /**
   * Calculate Banister's TRIMP (Training Impulse)
   * TRIMP = Duration × ΔHR ratio × Y
   * Where Y = 0.64 × e^(1.92 × ΔHR ratio) for men
   *       Y = 0.86 × e^(1.67 × ΔHR ratio) for women
   */
  static calculateBanisterTRIMP(params: TRIMPParams): number {
    const {
      duration,
      averageHeartRate,
      restingHeartRate,
      maxHeartRate,
      gender,
    } = params;

    // Calculate heart rate reserve ratio
    const deltaHRRatio =
      (averageHeartRate - restingHeartRate) / (maxHeartRate - restingHeartRate);

    // Ensure ratio is between 0 and 1
    const clampedRatio = Math.max(0, Math.min(1, deltaHRRatio));

    // Gender-specific exponential weighting factor
    let Y: number;
    if (gender === 'male') {
      Y = 0.64 * Math.exp(1.92 * clampedRatio);
    } else {
      Y = 0.86 * Math.exp(1.67 * clampedRatio);
    }

    // Duration in minutes
    const durationMinutes = duration / 60;

    // Calculate TRIMP
    const trimp = durationMinutes * clampedRatio * Y;

    return Math.round(trimp * 10) / 10; // Round to 1 decimal place
  }

  /**
   * Calculate Zone-based TRIMP (Modified approach)
   * Uses different multipliers for each heart rate zone
   */
  static calculateZoneTRIMP(zoneSummary: ZoneSummary[]): number {
    // Zone multipliers based on intensity
    const zoneMultipliers = {
      [HeartRateZone.ZONE_1]: 1.0,
      [HeartRateZone.ZONE_2]: 2.0,
      [HeartRateZone.ZONE_3]: 3.0,
      [HeartRateZone.ZONE_4]: 4.0,
      [HeartRateZone.ZONE_5]: 5.0,
    };

    let totalTRIMP = 0;

    zoneSummary.forEach(zone => {
      const timeInMinutes = zone.timeInZone / 60;
      const multiplier = zoneMultipliers[zone.zone];
      totalTRIMP += timeInMinutes * multiplier;
    });

    return Math.round(totalTRIMP * 10) / 10;
  }

  /**
   * Calculate simplified TRIMP (Easy to understand)
   * TRIMP = Duration (min) × Average HR percentage × Intensity factor
   */
  static calculateSimplifiedTRIMP(
    duration: number,
    averageHeartRate: number,
    maxHeartRate: number,
  ): number {
    const durationMinutes = duration / 60;
    const hrPercentage = (averageHeartRate / maxHeartRate) * 100;

    // Intensity factor based on HR percentage
    let intensityFactor: number;
    if (hrPercentage < 60) intensityFactor = 1.0;
    else if (hrPercentage < 70) intensityFactor = 1.5;
    else if (hrPercentage < 80) intensityFactor = 2.0;
    else if (hrPercentage < 90) intensityFactor = 3.0;
    else intensityFactor = 4.0;

    const trimp = durationMinutes * (hrPercentage / 100) * intensityFactor;

    return Math.round(trimp * 10) / 10;
  }

  /**
   * Calculate Edwards TRIMP (Heart Rate Zone method)
   * Uses 5 zones with specific multipliers
   */
  static calculateEdwardsTRIMP(zoneSummary: ZoneSummary[]): number {
    // Edwards zone multipliers (more conservative than zone-based)
    const edwardsMultipliers = {
      [HeartRateZone.ZONE_1]: 1,
      [HeartRateZone.ZONE_2]: 2,
      [HeartRateZone.ZONE_3]: 3,
      [HeartRateZone.ZONE_4]: 4,
      [HeartRateZone.ZONE_5]: 5,
    };

    let totalTRIMP = 0;

    zoneSummary.forEach(zone => {
      const timeInMinutes = zone.timeInZone / 60;
      const multiplier = edwardsMultipliers[zone.zone];
      totalTRIMP += timeInMinutes * multiplier;
    });

    return Math.round(totalTRIMP);
  }

  /**
   * Calculate all TRIMP methods for comparison
   */
  static calculateAllTRIMPMethods(
    session: TrainingSession,
    userParams: Omit<TRIMPParams, 'duration' | 'averageHeartRate'>,
  ) {
    const params: TRIMPParams = {
      duration: session.duration,
      averageHeartRate: session.averageHeartRate,
      ...userParams,
    };

    return {
      banister: this.calculateBanisterTRIMP(params),
      zone: this.calculateZoneTRIMP(session.zoneSummary),
      simplified: this.calculateSimplifiedTRIMP(
        session.duration,
        session.averageHeartRate,
        userParams.maxHeartRate,
      ),
      edwards: this.calculateEdwardsTRIMP(session.zoneSummary),
    };
  }
}

/**
 * Training Load Calculator
 * For calculating cumulative training stress and fitness metrics
 */
export class TrainingLoadCalculator {
  /**
   * Calculate Acute Training Load (ATL) - Average TRIMP over last 7 days
   */
  static calculateATL(sessions: TrainingSession[], targetDate: Date): number {
    const sevenDaysAgo = new Date(targetDate);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentSessions = sessions.filter(
      session => session.date >= sevenDaysAgo && session.date <= targetDate,
    );

    if (recentSessions.length === 0) return 0;

    const totalTRIMP = recentSessions.reduce(
      (sum, session) => sum + (session.trimpScore || 0),
      0,
    );

    return Math.round((totalTRIMP / 7) * 10) / 10;
  }

  /**
   * Calculate Chronic Training Load (CTL) - Average TRIMP over last 42 days (6 weeks)
   */
  static calculateCTL(sessions: TrainingSession[], targetDate: Date): number {
    const fortyTwoDaysAgo = new Date(targetDate);
    fortyTwoDaysAgo.setDate(fortyTwoDaysAgo.getDate() - 42);

    const recentSessions = sessions.filter(
      session => session.date >= fortyTwoDaysAgo && session.date <= targetDate,
    );

    if (recentSessions.length === 0) return 0;

    const totalTRIMP = recentSessions.reduce(
      (sum, session) => sum + (session.trimpScore || 0),
      0,
    );

    return Math.round((totalTRIMP / 42) * 10) / 10;
  }

  /**
   * Calculate Training Stress Balance (TSB) = CTL - ATL
   * Positive = Rested/Fresh, Negative = Fatigued
   */
  static calculateTSB(atl: number, ctl: number): number {
    return Math.round((ctl - atl) * 10) / 10;
  }

  /**
   * Calculate weekly training loads for trend analysis
   */
  static calculateWeeklyLoads(
    sessions: TrainingSession[],
    weeks: number = 12,
  ): number[] {
    const weeklyLoads: number[] = [];
    const now = new Date();

    for (let i = weeks - 1; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - i * 7 - 6);
      const weekEnd = new Date(now);
      weekEnd.setDate(now.getDate() - i * 7);

      const weekSessions = sessions.filter(
        session => session.date >= weekStart && session.date <= weekEnd,
      );

      const weeklyTRIMP = weekSessions.reduce(
        (sum, session) => sum + (session.trimpScore || 0),
        0,
      );

      weeklyLoads.push(Math.round(weeklyTRIMP * 10) / 10);
    }

    return weeklyLoads;
  }
}

/**
 * Heart Rate Zone Analysis
 */
export class HeartRateZoneCalculator {
  /**
   * Calculate zone thresholds based on different methods
   */
  static calculateZoneThresholds(
    maxHR: number,
    method: 'percentage' | 'karvonen' = 'percentage',
    restingHR?: number,
  ) {
    if (method === 'karvonen' && restingHR) {
      // Karvonen method (Heart Rate Reserve)
      const hrReserve = maxHR - restingHR;
      return {
        [HeartRateZone.ZONE_1]: {
          min: restingHR + hrReserve * 0.5,
          max: restingHR + hrReserve * 0.6,
        },
        [HeartRateZone.ZONE_2]: {
          min: restingHR + hrReserve * 0.6,
          max: restingHR + hrReserve * 0.7,
        },
        [HeartRateZone.ZONE_3]: {
          min: restingHR + hrReserve * 0.7,
          max: restingHR + hrReserve * 0.8,
        },
        [HeartRateZone.ZONE_4]: {
          min: restingHR + hrReserve * 0.8,
          max: restingHR + hrReserve * 0.9,
        },
        [HeartRateZone.ZONE_5]: {
          min: restingHR + hrReserve * 0.9,
          max: maxHR,
        },
      };
    } else {
      // Simple percentage method
      return {
        [HeartRateZone.ZONE_1]: { min: maxHR * 0.5, max: maxHR * 0.6 },
        [HeartRateZone.ZONE_2]: { min: maxHR * 0.6, max: maxHR * 0.7 },
        [HeartRateZone.ZONE_3]: { min: maxHR * 0.7, max: maxHR * 0.8 },
        [HeartRateZone.ZONE_4]: { min: maxHR * 0.8, max: maxHR * 0.9 },
        [HeartRateZone.ZONE_5]: { min: maxHR * 0.9, max: maxHR },
      };
    }
  }

  /**
   * Get zone names and descriptions
   */
  static getZoneInfo() {
    return {
      [HeartRateZone.ZONE_1]: {
        name: 'Active Recovery',
        description: 'Very light intensity, active recovery',
        color: '#4CAF50', // Green
      },
      [HeartRateZone.ZONE_2]: {
        name: 'Aerobic Base',
        description: 'Light intensity, base building',
        color: '#8BC34A', // Light Green
      },
      [HeartRateZone.ZONE_3]: {
        name: 'Aerobic Threshold',
        description: 'Moderate intensity, aerobic development',
        color: '#FFC107', // Amber
      },
      [HeartRateZone.ZONE_4]: {
        name: 'Lactate Threshold',
        description: 'Hard intensity, lactate threshold',
        color: '#FF9800', // Orange
      },
      [HeartRateZone.ZONE_5]: {
        name: 'VO2 Max',
        description: 'Very hard intensity, VO2 max',
        color: '#F44336', // Red
      },
    };
  }

  /**
   * Calculate time distribution across zones for multiple sessions
   */
  static calculateZoneDistribution(sessions: TrainingSession[]) {
    const totalTime: { [key in HeartRateZone]: number } = {
      [HeartRateZone.ZONE_1]: 0,
      [HeartRateZone.ZONE_2]: 0,
      [HeartRateZone.ZONE_3]: 0,
      [HeartRateZone.ZONE_4]: 0,
      [HeartRateZone.ZONE_5]: 0,
    };

    let overallTotalTime = 0;

    sessions.forEach(session => {
      session.zoneSummary.forEach(zone => {
        totalTime[zone.zone] += zone.timeInZone;
        overallTotalTime += zone.timeInZone;
      });
    });

    return Object.entries(totalTime).map(([zone, time]) => ({
      zone: parseInt(zone) as HeartRateZone,
      totalTime: time,
      percentage: overallTotalTime > 0 ? (time / overallTotalTime) * 100 : 0,
    }));
  }
}
