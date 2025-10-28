/**
 * Test script to demonstrate the Analytics Dashboard functionality
 * Run this to see how the dummy data generator, TRIMP calculator, and analytics work together
 */

import { DummyDataGenerator } from './DummyDataGenerator';
import { AnalyticsService } from './AnalyticsService';
import { UserProfile, TrainingType } from '../types/training';

// Example usage and testing
export const testAnalyticsDashboard = () => {
  console.log('🏃‍♂️ Testing Analytics Dashboard Components...\n');

  // 1. Create user profile
  const userProfile: UserProfile = {
    id: 'test-user',
    age: 28,
    restingHeartRate: 65,
    maxHeartRate: 192, // 220 - age
    weight: 75,
    fitnessLevel: 'intermediate',
  };

  console.log('👤 User Profile:', userProfile);

  // 2. Generate dummy training data
  const dataGenerator = new DummyDataGenerator(userProfile);

  // Generate sessions over the last 3 months
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 3);
  const endDate = new Date();

  console.log(
    `\n📊 Generating training sessions from ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}...`,
  );

  const sessions = dataGenerator.generateSessions(startDate, endDate, 4); // 4 sessions per week
  console.log(`✅ Generated ${sessions.length} training sessions`);

  // 3. Enrich sessions with TRIMP scores
  const enrichedSessions = AnalyticsService.enrichSessionsWithTRIMP(
    sessions,
    userProfile,
  );
  console.log('✅ Calculated TRIMP scores for all sessions');

  // 4. Calculate training metrics for the last month
  const monthAgo = new Date();
  monthAgo.setMonth(monthAgo.getMonth() - 1);

  const metrics = AnalyticsService.calculateTrainingMetrics(
    enrichedSessions,
    monthAgo,
    endDate,
  );

  console.log('\n📈 Last Month Training Metrics:');
  console.log(`- Total Sessions: ${metrics.totalSessions}`);
  console.log(
    `- Total Duration: ${Math.round(metrics.totalDuration / 60)} minutes`,
  );
  console.log(`- Average TRIMP: ${metrics.averageTRIMP}`);
  console.log(`- Average Heart Rate: ${metrics.averageHeartRate} BPM`);

  console.log('\n💓 Heart Rate Zone Distribution:');
  metrics.zoneDistribution.forEach(zone => {
    console.log(
      `  Zone ${zone.zone}: ${zone.percentage.toFixed(1)}% (${Math.round(
        zone.totalTime / 60,
      )} min)`,
    );
  });

  console.log('\n🏃 Training Type Distribution:');
  metrics.typeDistribution.forEach(type => {
    console.log(
      `  ${type.type}: ${type.sessions} sessions (${type.percentage.toFixed(
        1,
      )}%)`,
    );
  });

  // 5. Get training load analysis
  const loadAnalysis =
    AnalyticsService.getTrainingLoadAnalysis(enrichedSessions);

  console.log('\n⚡ Training Load Analysis:');
  console.log(`- Acute Training Load (ATL): ${loadAnalysis.acuteTrainingLoad}`);
  console.log(
    `- Chronic Training Load (CTL): ${loadAnalysis.chronicTrainingLoad}`,
  );
  console.log(
    `- Training Stress Balance (TSB): ${loadAnalysis.trainingStressBalance}`,
  );
  console.log(`- Status: ${loadAnalysis.status}`);
  console.log(`- Recommendation: ${loadAnalysis.recommendation}`);

  // 6. Generate chart data
  const chartData = AnalyticsService.generateChartData(metrics);

  console.log('\n📊 Chart Data Generated:');
  console.log(
    `- Zone Distribution: ${chartData.zoneDistribution.data.length} data points`,
  );
  console.log(`- TRIMP Trend: ${chartData.trimpTrend.data.length} weeks`);
  console.log(
    `- Type Distribution: ${chartData.typeDistribution.data.length} training types`,
  );
  console.log(`- Weekly Volume: ${chartData.weeklyVolume.data.length} weeks`);

  // 7. Get performance insights
  const insights =
    AnalyticsService.calculatePerformanceInsights(enrichedSessions);

  if (insights) {
    console.log('\n🔍 Performance Insights:');
    console.log(`- Heart Rate Trend: ${insights.heartRateTrend}`);
    console.log(`- TRIMP Trend: ${insights.trimpTrend}`);
    console.log(`- Training Consistency: ${insights.consistency.toFixed(1)}%`);
    if (insights.insights.length > 0) {
      console.log('- Key Insights:');
      insights.insights.forEach(insight => console.log(`  • ${insight}`));
    }
  }

  // 8. Sample individual session details
  const latestSession = enrichedSessions[enrichedSessions.length - 1];
  console.log('\n🎯 Latest Session Details:');
  console.log(`- Type: ${latestSession.type}`);
  console.log(`- Duration: ${Math.round(latestSession.duration / 60)} minutes`);
  console.log(`- Average HR: ${latestSession.averageHeartRate} BPM`);
  console.log(`- TRIMP Score: ${latestSession.trimpScore}`);
  console.log(
    `- Distance: ${
      latestSession.distance ? Math.round(latestSession.distance) + 'm' : 'N/A'
    }`,
  );

  console.log('\n✨ Analytics Dashboard Test Complete! ✨');

  return {
    userProfile,
    sessions: enrichedSessions,
    metrics,
    chartData,
    loadAnalysis,
    insights,
  };
};

// Export sample data function for use in components
export const generateSampleData = () => {
  const userProfile: UserProfile = {
    id: 'demo-user',
    age: 30,
    restingHeartRate: 60,
    maxHeartRate: 190,
    weight: 70,
    fitnessLevel: 'intermediate',
  };

  const dataGenerator = new DummyDataGenerator(userProfile);

  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 2);
  const endDate = new Date();

  let sessions = dataGenerator.generateSessions(startDate, endDate, 3);
  sessions = AnalyticsService.enrichSessionsWithTRIMP(sessions, userProfile);

  const monthAgo = new Date();
  monthAgo.setMonth(monthAgo.getMonth() - 1);

  const metrics = AnalyticsService.calculateTrainingMetrics(
    sessions,
    monthAgo,
    endDate,
  );
  const chartData = AnalyticsService.generateChartData(metrics);
  const loadAnalysis = AnalyticsService.getTrainingLoadAnalysis(sessions);

  return {
    userProfile,
    sessions,
    metrics,
    chartData,
    loadAnalysis,
  };
};
