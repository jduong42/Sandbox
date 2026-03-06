import {
  TrainingSession,
  TrainingMetrics,
  TrainingType,
  HeartRateZone,
  ChartData,
  UserProfile,
} from '../types/training';
import {
  TRIMPCalculator,
  TrainingLoadCalculator,
  HeartRateZoneCalculator,
} from './TRIMPCalculator';

/**
 * Analytics Service for processing training data and generating dashboard metrics
 */
export class AnalyticsService {
  /**
   * Calculate comprehensive training metrics for a time period
   */
  static calculateTrainingMetrics(
    sessions: TrainingSession[],
    periodStart: Date,
    periodEnd: Date,
  ): TrainingMetrics {
    // Filter sessions within the time period
    const periodSessions = sessions.filter(
      session => session.date >= periodStart && session.date <= periodEnd,
    );

    if (periodSessions.length === 0) {
      return this.getEmptyMetrics(periodStart, periodEnd);
    }

    // Calculate volume metrics
    const totalDuration = periodSessions.reduce(
      (sum, session) => sum + session.duration,
      0,
    );
    const totalDistance = periodSessions.reduce(
      (sum, session) => sum + (session.distance || 0),
      0,
    );
    const averageSessionDuration = totalDuration / periodSessions.length;

    // Calculate intensity metrics
    const trimpScores = periodSessions.map(session => session.trimpScore || 0);
    const averageTRIMP =
      trimpScores.reduce((sum, trimp) => sum + trimp, 0) / trimpScores.length;
    const totalTrainingLoad = trimpScores.reduce(
      (sum, trimp) => sum + trimp,
      0,
    );

    const heartRates = periodSessions.map(session => session.averageHeartRate);
    const averageHeartRate =
      heartRates.reduce((sum, hr) => sum + hr, 0) / heartRates.length;

    // Calculate zone distribution
    const zoneDistribution =
      HeartRateZoneCalculator.calculateZoneDistribution(periodSessions);

    // Calculate training type distribution
    const typeDistribution = this.calculateTypeDistribution(periodSessions);

    // Calculate weekly trends
    const weeklyTRIMP = this.calculateWeeklyTrends(
      sessions,
      periodEnd,
      'trimp',
    );
    const weeklyDuration = this.calculateWeeklyTrends(
      sessions,
      periodEnd,
      'duration',
    );

    return {
      periodStart,
      periodEnd,
      totalSessions: periodSessions.length,
      totalDuration,
      totalDistance,
      averageSessionDuration,
      averageTRIMP: Math.round(averageTRIMP * 10) / 10,
      totalTrainingLoad: Math.round(totalTrainingLoad * 10) / 10,
      averageHeartRate: Math.round(averageHeartRate),
      zoneDistribution,
      typeDistribution,
      weeklyTRIMP,
      weeklyDuration,
    };
  }

  /**
   * Calculate training type distribution
   */
  private static calculateTypeDistribution(sessions: TrainingSession[]) {
    const typeCounts: {
      [key in TrainingType]: { sessions: number; duration: number };
    } = {
      [TrainingType.JOGGING]: { sessions: 0, duration: 0 },
      [TrainingType.RUNNING]: { sessions: 0, duration: 0 },
      [TrainingType.INTERVAL_TRAINING]: { sessions: 0, duration: 0 },
      [TrainingType.TEMPO_RUN]: { sessions: 0, duration: 0 },
      [TrainingType.LONG_DISTANCE]: { sessions: 0, duration: 0 },
      [TrainingType.RECOVERY_RUN]: { sessions: 0, duration: 0 },
      [TrainingType.FARTLEK]: { sessions: 0, duration: 0 },
    };

    sessions.forEach(session => {
      typeCounts[session.type].sessions++;
      typeCounts[session.type].duration += session.duration;
    });

    const totalSessions = sessions.length;

    return Object.entries(typeCounts)
      .map(([type, data]) => ({
        type: type as TrainingType,
        sessions: data.sessions,
        percentage:
          totalSessions > 0 ? (data.sessions / totalSessions) * 100 : 0,
        totalDuration: data.duration,
      }))
      .filter(item => item.sessions > 0); // Only include types that were actually used
  }

  /**
   * Calculate weekly trends for TRIMP or duration
   */
  private static calculateWeeklyTrends(
    allSessions: TrainingSession[],
    endDate: Date,
    metric: 'trimp' | 'duration',
  ): number[] {
    const weeks = 12; // Last 12 weeks
    const weeklyData: number[] = [];

    for (let i = weeks - 1; i >= 0; i--) {
      const weekStart = new Date(endDate);
      weekStart.setDate(endDate.getDate() - i * 7 - 6);
      const weekEnd = new Date(endDate);
      weekEnd.setDate(endDate.getDate() - i * 7);

      const weekSessions = allSessions.filter(
        session => session.date >= weekStart && session.date <= weekEnd,
      );

      let weeklyValue = 0;
      if (metric === 'trimp') {
        weeklyValue = weekSessions.reduce(
          (sum, session) => sum + (session.trimpScore || 0),
          0,
        );
      } else if (metric === 'duration') {
        weeklyValue =
          weekSessions.reduce((sum, session) => sum + session.duration, 0) / 60; // Convert to minutes
      }

      weeklyData.push(Math.round(weeklyValue * 10) / 10);
    }

    return weeklyData;
  }

  /**
   * Generate chart data for different visualizations
   */
  static generateChartData(metrics: TrainingMetrics): {
    zoneDistribution: ChartData;
    trimpTrend: ChartData;
    typeDistribution: ChartData;
    weeklyVolume: ChartData;
  } {
    // Zone distribution bar chart with better labels and time information
    const zoneDistribution: ChartData = {
      data: metrics.zoneDistribution.map(zone => ({
        x: `Zone ${zone.zone}`,
        y: Math.round(zone.totalTime / 60), // Convert to minutes
        label: `${Math.round(zone.totalTime / 60)} min`,
        color: AnalyticsService.getZoneColor(zone.zone),
      })),
      title: 'Time in Heart Rate Zones',
      chartType: 'bar',
      xAxisLabel: 'Heart Rate Zones',
      yAxisLabel: 'Time (minutes)',
    };

    // TRIMP trend line chart
    const trimpTrend: ChartData = {
      data: metrics.weeklyTRIMP.map((trimp, index) => ({
        x: index + 1,
        y: trimp,
        label: `Week ${index + 1}`,
      })),
      title: 'Weekly TRIMP Trend',
      xAxisLabel: 'Weeks',
      yAxisLabel: 'TRIMP Score',
      chartType: 'line',
    };

    // Training type distribution bar chart
    const typeDistribution: ChartData = {
      data: metrics.typeDistribution.map(type => ({
        x: this.formatTrainingTypeName(type.type),
        y: type.sessions,
        label: `${type.sessions} sessions`,
      })),
      title: 'Training Type Distribution',
      xAxisLabel: 'Training Types',
      yAxisLabel: 'Sessions',
      chartType: 'bar',
    };

    // Weekly volume area chart
    const weeklyVolume: ChartData = {
      data: metrics.weeklyDuration.map((duration, index) => ({
        x: index + 1,
        y: Math.round(duration),
        label: `${Math.round(duration)} min`,
      })),
      title: 'Weekly Training Volume',
      xAxisLabel: 'Weeks',
      yAxisLabel: 'Minutes',
      chartType: 'area',
    };

    return {
      zoneDistribution,
      trimpTrend,
      typeDistribution,
      weeklyVolume,
    };
  }

  /**
   * Calculate and enrich training sessions with TRIMP scores
   */
  static enrichSessionsWithTRIMP(
    sessions: TrainingSession[],
    userProfile: UserProfile,
  ): TrainingSession[] {
    return sessions.map(session => {
      const trimpMethods = TRIMPCalculator.calculateAllTRIMPMethods(session, {
        restingHeartRate: userProfile.restingHeartRate,
        maxHeartRate: userProfile.maxHeartRate,
        gender: userProfile.sex ?? 'male',
      });

      // Use Banister TRIMP as the main score
      return {
        ...session,
        trimpScore: trimpMethods.banister,
        trainingLoad: trimpMethods.simplified,
      };
    });
  }

  /**
   * Get training load analysis (ATL, CTL, TSB)
   */
  static getTrainingLoadAnalysis(
    sessions: TrainingSession[],
    targetDate: Date = new Date(),
  ) {
    const atl = TrainingLoadCalculator.calculateATL(sessions, targetDate);
    const ctl = TrainingLoadCalculator.calculateCTL(sessions, targetDate);
    const tsb = TrainingLoadCalculator.calculateTSB(atl, ctl);

    return {
      acuteTrainingLoad: atl,
      chronicTrainingLoad: ctl,
      trainingStressBalance: tsb,
      status: this.getTrainingStatus(tsb),
      recommendation: this.getTrainingRecommendation(tsb, atl, ctl),
    };
  }

  /**
   * Get fitness status based on Training Stress Balance
   */
  private static getTrainingStatus(
    tsb: number,
  ): 'fresh' | 'neutral' | 'fatigued' | 'overreached' {
    if (tsb > 10) return 'fresh';
    if (tsb > -10) return 'neutral';
    if (tsb > -30) return 'fatigued';
    return 'overreached';
  }

  /**
   * Get training recommendations based on load analysis
   */
  private static getTrainingRecommendation(
    tsb: number,
    atl: number,
    ctl: number,
  ): string {
    if (tsb > 15) {
      return "You're well rested! Good time for high-intensity training or racing.";
    } else if (tsb > 5) {
      return "You're fresh and ready for moderate to high intensity work.";
    } else if (tsb > -10) {
      return 'Balanced state. Continue with your current training plan.';
    } else if (tsb > -25) {
      return "You're showing signs of fatigue. Consider easier sessions or rest.";
    } else {
      return 'High fatigue detected. Prioritize recovery and avoid high intensity.';
    }
  }

  /**
   * Get heart rate range for a specific zone
   */
  static getZoneHRRange(zone: number): string {
    const zoneRanges = {
      1: '50-60%',
      2: '60-70%',
      3: '70-80%',
      4: '80-90%',
      5: '90-100%',
    };
    return zoneRanges[zone as keyof typeof zoneRanges] || '';
  }

  /**
   * Get color for a specific heart rate zone
   */
  static getZoneColor(zone: number): string {
    const zoneColors = {
      1: '#4CAF50', // Green - Easy/Recovery
      2: '#8BC34A', // Light Green - Aerobic Base
      3: '#FFC107', // Yellow - Aerobic
      4: '#FF9800', // Orange - Threshold
      5: '#F44336', // Red - VO2 Max/Anaerobic
    };
    return zoneColors[zone as keyof typeof zoneColors] || '#74b9ff';
  }

  /**
   * Format training type names for display
   */
  private static formatTrainingTypeName(type: TrainingType): string {
    const names = {
      [TrainingType.JOGGING]: 'Jog',
      [TrainingType.RUNNING]: 'Run',
      [TrainingType.INTERVAL_TRAINING]: 'Intervals',
      [TrainingType.TEMPO_RUN]: 'Tempo',
      [TrainingType.LONG_DISTANCE]: 'Long Run',
      [TrainingType.RECOVERY_RUN]: 'Recovery',
      [TrainingType.FARTLEK]: 'Fartlek',
    };

    return names[type];
  }

  /**
   * Get empty metrics structure
   */
  private static getEmptyMetrics(
    periodStart: Date,
    periodEnd: Date,
  ): TrainingMetrics {
    return {
      periodStart,
      periodEnd,
      totalSessions: 0,
      totalDuration: 0,
      totalDistance: 0,
      averageSessionDuration: 0,
      averageTRIMP: 0,
      totalTrainingLoad: 0,
      averageHeartRate: 0,
      zoneDistribution: [],
      typeDistribution: [],
      weeklyTRIMP: Array(12).fill(0),
      weeklyDuration: Array(12).fill(0),
    };
  }

  /**
   * Calculate performance trends and insights
   */
  static calculatePerformanceInsights(sessions: TrainingSession[]) {
    const recentSessions = sessions.slice(-10); // Last 10 sessions
    const olderSessions = sessions.slice(-20, -10); // Previous 10 sessions

    if (recentSessions.length === 0) return null;

    const recentAvgHR =
      recentSessions.reduce((sum, s) => sum + s.averageHeartRate, 0) /
      recentSessions.length;
    const recentAvgTRIMP =
      recentSessions.reduce((sum, s) => sum + (s.trimpScore || 0), 0) /
      recentSessions.length;

    let trends = {
      heartRateTrend: 'stable' as 'improving' | 'declining' | 'stable',
      trimpTrend: 'stable' as 'increasing' | 'decreasing' | 'stable',
      consistency: 0,
      insights: [] as string[],
    };

    if (olderSessions.length > 0) {
      const olderAvgHR =
        olderSessions.reduce((sum, s) => sum + s.averageHeartRate, 0) /
        olderSessions.length;
      const olderAvgTRIMP =
        olderSessions.reduce((sum, s) => sum + (s.trimpScore || 0), 0) /
        olderSessions.length;

      // Heart rate trend (lower is better for same intensity)
      if (recentAvgHR < olderAvgHR - 3) trends.heartRateTrend = 'improving';
      else if (recentAvgHR > olderAvgHR + 3)
        trends.heartRateTrend = 'declining';

      // TRIMP trend
      if (recentAvgTRIMP > olderAvgTRIMP * 1.1)
        trends.trimpTrend = 'increasing';
      else if (recentAvgTRIMP < olderAvgTRIMP * 0.9)
        trends.trimpTrend = 'decreasing';
    }

    // Calculate consistency (sessions per week)
    const weeksSpanned = Math.ceil(
      (new Date().getTime() - recentSessions[0].date.getTime()) /
        (7 * 24 * 60 * 60 * 1000),
    );
    trends.consistency = Math.min(
      100,
      (recentSessions.length / Math.max(1, weeksSpanned * 3)) * 100,
    );

    // Generate insights
    if (trends.heartRateTrend === 'improving') {
      trends.insights.push('Your aerobic efficiency is improving! 🎉');
    }
    if (trends.trimpTrend === 'increasing') {
      trends.insights.push(
        'Training intensity is increasing. Monitor recovery.',
      );
    }
    if (trends.consistency > 75) {
      trends.insights.push('Excellent training consistency! 💪');
    } else if (trends.consistency < 50) {
      trends.insights.push(
        'Try to maintain more consistent training schedule.',
      );
    }

    return trends;
  }
}
