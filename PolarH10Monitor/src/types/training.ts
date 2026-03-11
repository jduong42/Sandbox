// Training Data Types for Analytics Dashboard

/**
 * Types of cardio training sessions
 */
export enum TrainingType {
  // Running variants
  JOGGING = 'jogging',
  RUNNING = 'running',
  INTERVAL_TRAINING = 'interval_training',
  TEMPO_RUN = 'tempo_run',
  LONG_DISTANCE = 'long_distance',
  RECOVERY_RUN = 'recovery_run',
  FARTLEK = 'fartlek',
  // Other activity types
  CYCLING = 'cycling',
  HIIT = 'hiit',
  STRENGTH = 'strength',
  YOGA = 'yoga',
  SWIMMING = 'swimming',
  WALKING = 'walking',
}

/**
 * Heart Rate Zones based on percentage of max HR
 */
export enum HeartRateZone {
  ZONE_1 = 1, // 50-60% - Active Recovery
  ZONE_2 = 2, // 60-70% - Aerobic Base
  ZONE_3 = 3, // 70-80% - Aerobic Threshold
  ZONE_4 = 4, // 80-90% - Lactate Threshold
  ZONE_5 = 5, // 90-100% - VO2 Max
}

/**
 * Individual heart rate data point
 */
export interface HeartRateDataPoint {
  timestamp: Date;
  heartRate: number; // BPM
  rrInterval?: number; // R-R interval in milliseconds (for HRV)
  zone: HeartRateZone;
}

/**
 * Heart rate zone summary for a session
 */
export interface ZoneSummary {
  zone: HeartRateZone;
  timeInZone: number; // Duration in seconds
  percentage: number; // Percentage of total session time
  averageHR: number;
  maxHR: number;
}

/**
 * User profile data for calculations
 */
export interface UserProfile {
  id: string;
  age: number;
  restingHeartRate: number;
  maxHeartRate: number;
  weight?: number; // kg - optional for some calculations
  fitnessLevel?: 'beginner' | 'intermediate' | 'advanced';
  /** Biological sex — used for the gender factor in Banister TRIMP */
  sex?: 'male' | 'female';
}

/**
 * Complete training session data
 */
export interface TrainingSession {
  id: string;
  userId: string;
  date: Date;
  startTime: Date;
  endTime: Date;
  duration: number; // Total duration in seconds

  // Training Details
  type: TrainingType;
  title?: string;
  description?: string;

  // Heart Rate Data
  heartRateData: HeartRateDataPoint[];
  averageHeartRate: number;
  maxHeartRate: number;
  minHeartRate: number;

  // Zone Analysis
  zoneSummary: ZoneSummary[];

  // Calculated Metrics
  trimpScore?: number; // Training Impulse score
  trainingLoad?: number;
  calories?: number;

  // Optional Session Data
  distance?: number; // meters
  pace?: number; // minutes per km
  elevation?: number; // meters gained

  // Session Quality (can be user input or calculated)
  perceivedEffort?: number; // 1-10 RPE scale
  sessionRating?: number; // 1-5 stars
  notes?: string;
}

/**
 * TRIMP calculation parameters
 */
export interface TRIMPParams {
  duration: number; // seconds
  averageHeartRate: number;
  restingHeartRate: number;
  maxHeartRate: number;
  gender: 'male' | 'female'; // Different formulas for men/women
}

/**
 * Analytics metrics for dashboard
 */
export interface TrainingMetrics {
  // Time Period
  periodStart: Date;
  periodEnd: Date;
  totalSessions: number;

  // Volume Metrics
  totalDuration: number; // seconds
  totalDistance?: number; // meters
  averageSessionDuration: number;

  // Intensity Metrics
  averageTRIMP: number;
  totalTrainingLoad: number;
  averageHeartRate: number;

  // Zone Distribution (across all sessions in period)
  zoneDistribution: {
    zone: HeartRateZone;
    totalTime: number; // seconds
    percentage: number;
  }[];

  // Training Type Distribution
  typeDistribution: {
    type: TrainingType;
    sessions: number;
    percentage: number;
    totalDuration: number;
  }[];

  // Trends
  weeklyTRIMP: number[];
  weeklyDuration: number[];
  fitnessScore?: number; // Calculated fitness trend
  fatigueScore?: number; // Calculated fatigue
  formScore?: number; // fitness - fatigue
}

/**
 * Chart data for visualizations
 */
export interface ChartDataPoint {
  x: string | number | Date;
  y: number;
  label?: string;
  color?: string;
}

export interface ChartData {
  data: ChartDataPoint[];
  title: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  chartType: 'line' | 'bar' | 'pie' | 'area';
}

/**
 * Dashboard configuration
 */
export interface DashboardConfig {
  timeframe: 'week' | 'month' | 'quarter' | 'year';
  showZones: boolean;
  showTRIMP: boolean;
  showTrainingLoad: boolean;
  showTypeDistribution: boolean;
  preferredChartTypes: {
    zones: 'pie' | 'bar';
    trimp: 'line' | 'bar';
    types: 'pie' | 'bar';
  };
}
