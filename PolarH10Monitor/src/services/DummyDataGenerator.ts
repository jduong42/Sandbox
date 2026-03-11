import {
  TrainingSession,
  TrainingType,
  HeartRateDataPoint,
  HeartRateZone,
  ZoneSummary,
  UserProfile,
} from '../types/training';

/**
 * Dummy Data Generator for Analytics Dashboard
 * Generates realistic training sessions with proper HR patterns
 */
export class DummyDataGenerator {
  private userProfile: UserProfile;

  constructor(userProfile?: Partial<UserProfile>) {
    // Default user profile
    this.userProfile = {
      id: 'user-123',
      age: userProfile?.age || 28,
      restingHeartRate: userProfile?.restingHeartRate || 65,
      maxHeartRate: userProfile?.maxHeartRate || 220 - (userProfile?.age || 28),
      weight: userProfile?.weight || 75,
      fitnessLevel: userProfile?.fitnessLevel || 'intermediate',
      ...userProfile,
    };
  }

  /**
   * Get heart rate zone thresholds based on user's max HR
   */
  private getZoneThresholds() {
    const maxHR = this.userProfile.maxHeartRate;
    return {
      [HeartRateZone.ZONE_1]: { min: maxHR * 0.5, max: maxHR * 0.6 },
      [HeartRateZone.ZONE_2]: { min: maxHR * 0.6, max: maxHR * 0.7 },
      [HeartRateZone.ZONE_3]: { min: maxHR * 0.7, max: maxHR * 0.8 },
      [HeartRateZone.ZONE_4]: { min: maxHR * 0.8, max: maxHR * 0.9 },
      [HeartRateZone.ZONE_5]: { min: maxHR * 0.9, max: maxHR * 1.0 },
    };
  }

  /**
   * Determine HR zone based on heart rate
   */
  private getHeartRateZone(heartRate: number): HeartRateZone {
    const thresholds = this.getZoneThresholds();

    for (const zone of [
      HeartRateZone.ZONE_5,
      HeartRateZone.ZONE_4,
      HeartRateZone.ZONE_3,
      HeartRateZone.ZONE_2,
      HeartRateZone.ZONE_1,
    ]) {
      if (heartRate >= thresholds[zone].min) {
        return zone;
      }
    }

    return HeartRateZone.ZONE_1;
  }

  /**
   * Generate realistic heart rate pattern for different training types
   */
  private generateHeartRatePattern(
    type: TrainingType,
    durationMinutes: number,
  ): {
    targetHR: number;
    variation: number;
    pattern: 'steady' | 'intervals' | 'progressive';
  } {
    const maxHR = this.userProfile.maxHeartRate;

    switch (type) {
      case TrainingType.RECOVERY_RUN:
        return { targetHR: maxHR * 0.65, variation: 5, pattern: 'steady' };

      case TrainingType.JOGGING:
        return { targetHR: maxHR * 0.72, variation: 8, pattern: 'steady' };

      case TrainingType.RUNNING:
        return { targetHR: maxHR * 0.82, variation: 10, pattern: 'steady' };

      case TrainingType.TEMPO_RUN:
        return { targetHR: maxHR * 0.85, variation: 6, pattern: 'progressive' };

      case TrainingType.INTERVAL_TRAINING:
        return { targetHR: maxHR * 0.88, variation: 20, pattern: 'intervals' };

      case TrainingType.LONG_DISTANCE:
        return { targetHR: maxHR * 0.75, variation: 12, pattern: 'steady' };

      case TrainingType.FARTLEK:
        return { targetHR: maxHR * 0.8, variation: 25, pattern: 'intervals' };

      default:
        return { targetHR: maxHR * 0.75, variation: 10, pattern: 'steady' };
    }
  }

  /**
   * Generate heart rate data points for a session
   */
  private generateHeartRateData(
    startTime: Date,
    durationMinutes: number,
    type: TrainingType,
  ): HeartRateDataPoint[] {
    const dataPoints: HeartRateDataPoint[] = [];
    const { targetHR, variation, pattern } = this.generateHeartRatePattern(
      type,
      durationMinutes,
    );

    // Generate data points every 5 seconds
    const intervalSeconds = 5;
    const totalPoints = (durationMinutes * 60) / intervalSeconds;

    for (let i = 0; i < totalPoints; i++) {
      const timestamp = new Date(
        startTime.getTime() + i * intervalSeconds * 1000,
      );
      let heartRate: number;

      // Generate HR based on pattern
      if (pattern === 'intervals') {
        // Create interval pattern (high/low cycles)
        const cyclePosition = (i / totalPoints) * 8; // 8 intervals
        const isHighIntensity = Math.floor(cyclePosition) % 2 === 0;
        const baseHR = isHighIntensity
          ? targetHR + variation
          : targetHR - variation / 2;
        heartRate = baseHR + (Math.random() - 0.5) * 10;
      } else if (pattern === 'progressive') {
        // Progressive increase throughout session
        const progress = i / totalPoints;
        const progressiveIncrease = progress * (variation * 2);
        heartRate =
          targetHR -
          variation +
          progressiveIncrease +
          (Math.random() - 0.5) * 8;
      } else {
        // Steady with natural variation
        heartRate = targetHR + (Math.random() - 0.5) * variation;
      }

      // Add warmup/cooldown effects
      if (i < totalPoints * 0.1) {
        // First 10% - warmup
        const warmupFactor = i / (totalPoints * 0.1);
        heartRate =
          this.userProfile.restingHeartRate +
          (heartRate - this.userProfile.restingHeartRate) * warmupFactor;
      } else if (i > totalPoints * 0.9) {
        // Last 10% - cooldown
        const cooldownFactor = (totalPoints - i) / (totalPoints * 0.1);
        heartRate =
          this.userProfile.restingHeartRate +
          (heartRate - this.userProfile.restingHeartRate) * cooldownFactor;
      }

      // Ensure realistic bounds
      heartRate = Math.max(
        50,
        Math.min(this.userProfile.maxHeartRate, Math.round(heartRate)),
      );

      dataPoints.push({
        timestamp,
        heartRate,
        rrInterval: this.generateRRInterval(heartRate), // Optional HRV data
        zone: this.getHeartRateZone(heartRate),
      });
    }

    return dataPoints;
  }

  /**
   * Generate realistic R-R interval based on heart rate
   */
  private generateRRInterval(heartRate: number): number {
    // R-R interval = 60000ms / heart rate + natural variation
    const baseInterval = 60000 / heartRate;
    const variation = baseInterval * 0.05 * (Math.random() - 0.5); // 5% variation
    return Math.round(baseInterval + variation);
  }

  /**
   * Calculate zone summary from heart rate data
   */
  private calculateZoneSummary(
    heartRateData: HeartRateDataPoint[],
  ): ZoneSummary[] {
    const zoneSummaries: {
      [key in HeartRateZone]: { timeInZone: number; heartRates: number[] };
    } = {
      [HeartRateZone.ZONE_1]: { timeInZone: 0, heartRates: [] },
      [HeartRateZone.ZONE_2]: { timeInZone: 0, heartRates: [] },
      [HeartRateZone.ZONE_3]: { timeInZone: 0, heartRates: [] },
      [HeartRateZone.ZONE_4]: { timeInZone: 0, heartRates: [] },
      [HeartRateZone.ZONE_5]: { timeInZone: 0, heartRates: [] },
    };

    // Each data point represents 5 seconds
    const intervalSeconds = 5;
    const totalDuration = heartRateData.length * intervalSeconds;

    heartRateData.forEach(point => {
      zoneSummaries[point.zone].timeInZone += intervalSeconds;
      zoneSummaries[point.zone].heartRates.push(point.heartRate);
    });

    return Object.entries(zoneSummaries).map(([zone, data]) => ({
      zone: parseInt(zone) as HeartRateZone,
      timeInZone: data.timeInZone,
      percentage: (data.timeInZone / totalDuration) * 100,
      averageHR:
        data.heartRates.length > 0
          ? Math.round(
              data.heartRates.reduce((a, b) => a + b, 0) /
                data.heartRates.length,
            )
          : 0,
      maxHR: data.heartRates.length > 0 ? Math.max(...data.heartRates) : 0,
    }));
  }

  /**
   * Generate a single training session
   */
  generateSession(
    date: Date = new Date(),
    type?: TrainingType,
    durationMinutes?: number,
  ): TrainingSession {
    // Random training type if not specified
    const sessionType = type || this.getRandomTrainingType();

    // Random duration based on training type
    const duration = durationMinutes || this.getTypicalDuration(sessionType);

    const startTime = new Date(date);
    startTime.setHours(
      Math.random() < 0.5 ? 7 + Math.random() * 2 : 17 + Math.random() * 3,
    ); // Morning or evening

    const endTime = new Date(startTime.getTime() + duration * 60 * 1000);

    // Generate heart rate data
    const heartRateData = this.generateHeartRateData(
      startTime,
      duration,
      sessionType,
    );

    // Calculate metrics
    const heartRates = heartRateData.map(d => d.heartRate);
    const averageHeartRate = Math.round(
      heartRates.reduce((a, b) => a + b, 0) / heartRates.length,
    );
    const maxHeartRate = Math.max(...heartRates);
    const minHeartRate = Math.min(...heartRates);

    const zoneSummary = this.calculateZoneSummary(heartRateData);

    return {
      id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId: this.userProfile.id,
      date,
      startTime,
      endTime,
      duration: duration * 60, // Convert to seconds
      type: sessionType,
      title: this.generateSessionTitle(sessionType, duration),
      heartRateData,
      averageHeartRate,
      maxHeartRate,
      minHeartRate,
      zoneSummary,
      // Optional metrics (will be calculated by analytics service)
      distance: this.estimateDistance(sessionType, duration),
      pace: this.estimatePace(sessionType),
      perceivedEffort:
        Math.floor(Math.random() * 4) +
        (sessionType === TrainingType.RECOVERY_RUN ? 3 : 6),
      sessionRating: Math.floor(Math.random() * 2) + 4, // 4-5 stars mostly
    };
  }

  /**
   * Generate multiple training sessions over a time period
   */
  generateSessions(
    startDate: Date,
    endDate: Date,
    sessionsPerWeek: number = 4,
  ): TrainingSession[] {
    const sessions: TrainingSession[] = [];
    const daysDiff = Math.floor(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    const totalWeeks = daysDiff / 7;
    const totalSessions = Math.floor(totalWeeks * sessionsPerWeek);

    for (let i = 0; i < totalSessions; i++) {
      const sessionDate = new Date(
        startDate.getTime() +
          (daysDiff / totalSessions) * i * 24 * 60 * 60 * 1000,
      );

      // Add some randomness to dates (don't train every exact interval)
      sessionDate.setDate(
        sessionDate.getDate() + Math.floor(Math.random() * 3 - 1),
      );

      const session = this.generateSession(sessionDate);
      sessions.push(session);
    }

    return sessions.sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  // Helper methods
  private getRandomTrainingType(): TrainingType {
    const types = Object.values(TrainingType);
    const weights: Partial<Record<TrainingType, number>> = {
      [TrainingType.JOGGING]: 30,
      [TrainingType.RUNNING]: 25,
      [TrainingType.RECOVERY_RUN]: 15,
      [TrainingType.LONG_DISTANCE]: 10,
      [TrainingType.INTERVAL_TRAINING]: 10,
      [TrainingType.TEMPO_RUN]: 8,
      [TrainingType.FARTLEK]: 2,
      [TrainingType.CYCLING]: 5,
      [TrainingType.HIIT]: 5,
      [TrainingType.STRENGTH]: 5,
      [TrainingType.YOGA]: 3,
      [TrainingType.SWIMMING]: 3,
      [TrainingType.WALKING]: 5,
    };

    const weightedTypes: TrainingType[] = [];
    Object.entries(weights).forEach(([type, weight]) => {
      for (let i = 0; i < weight; i++) {
        weightedTypes.push(type as TrainingType);
      }
    });

    return weightedTypes[Math.floor(Math.random() * weightedTypes.length)];
  }

  private getTypicalDuration(type: TrainingType): number {
    const durations: Partial<Record<TrainingType, number>> = {
      [TrainingType.RECOVERY_RUN]: 20 + Math.random() * 20, // 20-40 min
      [TrainingType.JOGGING]: 30 + Math.random() * 30, // 30-60 min
      [TrainingType.RUNNING]: 35 + Math.random() * 25, // 35-60 min
      [TrainingType.TEMPO_RUN]: 25 + Math.random() * 20, // 25-45 min
      [TrainingType.INTERVAL_TRAINING]: 20 + Math.random() * 25, // 20-45 min
      [TrainingType.LONG_DISTANCE]: 60 + Math.random() * 60, // 60-120 min
      [TrainingType.FARTLEK]: 30 + Math.random() * 30, // 30-60 min
      [TrainingType.CYCLING]: 40 + Math.random() * 50, // 40-90 min
      [TrainingType.HIIT]: 20 + Math.random() * 20, // 20-40 min
      [TrainingType.STRENGTH]: 30 + Math.random() * 30, // 30-60 min
      [TrainingType.YOGA]: 30 + Math.random() * 30, // 30-60 min
      [TrainingType.SWIMMING]: 30 + Math.random() * 30, // 30-60 min
      [TrainingType.WALKING]: 30 + Math.random() * 60, // 30-90 min
    };

    return Math.round(durations[type] ?? 30 + Math.random() * 30);
  }

  private generateSessionTitle(type: TrainingType, duration: number): string {
    const titles: Partial<Record<TrainingType, string[]>> = {
      [TrainingType.RECOVERY_RUN]: [`Easy Recovery Run`, `Recovery Jog`],
      [TrainingType.JOGGING]: [`Morning Jog`, `Easy Jog`, `Base Run`],
      [TrainingType.RUNNING]: [`Steady Run`, `Moderate Run`],
      [TrainingType.TEMPO_RUN]: [`Tempo Run`, `Threshold Run`],
      [TrainingType.INTERVAL_TRAINING]: [
        `Interval Training`,
        `Track Intervals`,
        `Speed Work`,
      ],
      [TrainingType.LONG_DISTANCE]: [
        `Long Run`,
        `Distance Run`,
        `Endurance Run`,
      ],
      [TrainingType.FARTLEK]: [`Fartlek Training`, `Play Run`],
      [TrainingType.CYCLING]: [`Cycling`, `Bike Ride`, `Road Cycling`],
      [TrainingType.HIIT]: [`HIIT Session`, `Circuit Training`, `High Intensity`],
      [TrainingType.STRENGTH]: [`Strength Training`, `Weight Session`, `Gym`],
      [TrainingType.YOGA]: [`Yoga Session`, `Flexibility`, `Stretch`],
      [TrainingType.SWIMMING]: [`Swimming`, `Pool Session`, `Swim`],
      [TrainingType.WALKING]: [`Walk`, `Morning Walk`, `Hiking`],
    };

    const options = titles[type] ?? [`Training Session`];
    const baseTitle = options[Math.floor(Math.random() * options.length)];
    return `${baseTitle} (${Math.round(duration)} min)`;
  }

  private estimateDistance(
    type: TrainingType,
    durationMinutes: number,
  ): number {
    // Rough pace estimates in meters per minute
    const paces: Partial<Record<TrainingType, number>> = {
      [TrainingType.RECOVERY_RUN]: 120, // ~8 min/km
      [TrainingType.JOGGING]: 150, // ~6:40 min/km
      [TrainingType.RUNNING]: 180, // ~5:30 min/km
      [TrainingType.TEMPO_RUN]: 200, // ~5 min/km
      [TrainingType.INTERVAL_TRAINING]: 220, // ~4:30 min/km
      [TrainingType.LONG_DISTANCE]: 140, // ~7 min/km
      [TrainingType.FARTLEK]: 170, // ~5:50 min/km
      [TrainingType.CYCLING]: 250, // ~4 min/km equivalent
      [TrainingType.WALKING]: 80, // ~12 min/km
      [TrainingType.SWIMMING]: 50, // pool distance
    };

    return Math.round((paces[type] ?? 0) * durationMinutes);
  }

  private estimatePace(type: TrainingType): number {
    // Pace in minutes per km
    const paces: Partial<Record<TrainingType, number>> = {
      [TrainingType.RECOVERY_RUN]: 8.0,
      [TrainingType.JOGGING]: 6.7,
      [TrainingType.RUNNING]: 5.5,
      [TrainingType.TEMPO_RUN]: 5.0,
      [TrainingType.INTERVAL_TRAINING]: 4.5,
      [TrainingType.LONG_DISTANCE]: 7.0,
      [TrainingType.FARTLEK]: 5.8,
      [TrainingType.CYCLING]: 3.5,
      [TrainingType.WALKING]: 12.0,
      [TrainingType.SWIMMING]: 2.5,
    };

    return (paces[type] ?? 6.0) + (Math.random() - 0.5) * 0.5; // Add some variation
  }
}
