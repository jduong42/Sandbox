import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { AnimatedTabView } from '../components';
import { theme } from '../theme';
import { generateSampleData } from '../services/AnalyticsDashboardTest';
import { DynamicChart } from '../components/analytics/ChartComponents';
import {
  HeartRateZonesChart,
  TrainingSessionsPieChart,
} from '../components/analytics';
import {
  AnalyticsHeader,
  TimeframeSelector,
  MetricCard,
  LoadAnalysis,
  ChartSection,
  MetricModal,
} from '../components/analytics/screens';
import { TrainingMetrics, ChartData } from '../types/training';
import { analyticsScreenStyles as styles } from '../theme/analyticsScreen';

interface AnalyticsData {
  metrics: TrainingMetrics;
  chartData: {
    zoneDistribution: ChartData;
    trimpTrend: ChartData;
    typeDistribution: ChartData;
    weeklyVolume: ChartData;
  };
  loadAnalysis: {
    acuteTrainingLoad: number;
    chronicTrainingLoad: number;
    trainingStressBalance: number;
    status: string;
    recommendation: string;
  };
}

const AnalyticsScreen: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState<
    'week' | 'month' | 'quarter'
  >('month');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<
    'ATL' | 'CTL' | 'TSB' | null
  >(null);

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedTimeframe]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 500));

      const sampleData = generateSampleData();
      setData({
        metrics: sampleData.metrics,
        chartData: sampleData.chartData,
        loadAnalysis: {
          acuteTrainingLoad: 85,
          chronicTrainingLoad: 92,
          trainingStressBalance: 7,
          status: 'fresh',
          recommendation:
            'You are well-recovered and ready for high-intensity training. Consider a challenging workout or race this week.',
        },
      });
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMetricPress = (metric: 'ATL' | 'CTL' | 'TSB') => {
    setSelectedMetric(metric);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedMetric(null);
  };

  // Loading state
  if (loading) {
    return (
      <AnimatedTabView>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading analytics...</Text>
        </View>
      </AnimatedTabView>
    );
  }

  // Error state
  if (!data) {
    return (
      <AnimatedTabView>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Unable to load analytics data. Please try again.
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={loadAnalyticsData}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </AnimatedTabView>
    );
  }

  return (
    <AnimatedTabView>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={loadAnalyticsData}
            colors={[theme.colors.primary]}
          />
        }
      >
        <StatusBar
          barStyle="dark-content"
          backgroundColor={theme.colors.background}
        />

        <AnalyticsHeader />

        <TimeframeSelector
          selectedTimeframe={selectedTimeframe}
          onTimeframeChange={setSelectedTimeframe}
        />

        {/* Key Metrics Row */}
        <View style={styles.metricsRow}>
          <MetricCard
            title="Total Sessions"
            value={data.metrics.totalSessions.toString()}
            subtitle={`${selectedTimeframe} period`}
            icon="activity"
          />
          <MetricCard
            title="Avg TRIMP"
            value={data.metrics.averageTRIMP.toString()}
            subtitle="Training stress"
            icon="trending-up"
          />
        </View>

        <View style={styles.metricsRow}>
          <MetricCard
            title="Total Duration"
            value={`${Math.round(data.metrics.totalDuration / 60)}h`}
            subtitle="Training time"
            icon="clock"
          />
          <MetricCard
            title="Avg HR"
            value={`${data.metrics.averageHeartRate} bpm`}
            subtitle="Heart rate"
            icon="heart"
          />
        </View>

        <LoadAnalysis
          loadAnalysis={data.loadAnalysis}
          onMetricPress={handleMetricPress}
        />

        <ChartSection title="Time in Heart Rate Zones">
          <HeartRateZonesChart data={data.chartData.zoneDistribution} />
        </ChartSection>

        <ChartSection title="TRIMP Trend">
          <DynamicChart data={data.chartData.trimpTrend} />
        </ChartSection>

        <ChartSection title="Training Sessions">
          <TrainingSessionsPieChart data={data.chartData.typeDistribution} />
        </ChartSection>

        <ChartSection title="Weekly Volume">
          <DynamicChart data={data.chartData.weeklyVolume} />
        </ChartSection>
      </ScrollView>

      <MetricModal
        visible={modalVisible}
        selectedMetric={selectedMetric}
        onClose={closeModal}
      />
    </AnimatedTabView>
  );
};

export default AnalyticsScreen;
