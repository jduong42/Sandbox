import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { theme } from '../../../theme';
import { analyticsScreenStyles as styles } from '../../../theme/analyticsScreen';

interface LoadAnalysisData {
  acuteTrainingLoad: number;
  chronicTrainingLoad: number;
  trainingStressBalance: number;
  status: string;
  recommendation: string;
}

interface LoadAnalysisProps {
  loadAnalysis: LoadAnalysisData;
  onMetricPress: (metric: 'ATL' | 'CTL' | 'TSB') => void;
}

export const LoadAnalysis: React.FC<LoadAnalysisProps> = ({
  loadAnalysis,
  onMetricPress,
}) => {
  const getATLInterpretation = (atl: number) => {
    if (atl < 50) return { text: 'Low', color: theme.colors.textSecondary };
    if (atl < 100) return { text: 'Moderate', color: theme.colors.warning };
    if (atl < 150) return { text: 'High', color: theme.colors.error };
    return { text: 'Very High', color: theme.colors.error };
  };

  const getCTLInterpretation = (ctl: number) => {
    if (ctl < 50)
      return { text: 'Beginner', color: theme.colors.textSecondary };
    if (ctl < 80) return { text: 'Recreational', color: theme.colors.warning };
    if (ctl < 120) return { text: 'Trained', color: theme.colors.success };
    return { text: 'Elite', color: theme.colors.primary };
  };

  const getTSBInterpretation = (tsb: number) => {
    if (tsb > 15)
      return {
        text: 'Very Fresh',
        color: theme.colors.success,
        advice: 'Ready for race/hard training',
      };
    if (tsb > 5)
      return {
        text: 'Fresh',
        color: theme.colors.success,
        advice: 'Good for performance',
      };
    if (tsb > -5)
      return {
        text: 'Balanced',
        color: theme.colors.warning,
        advice: 'Maintaining fitness',
      };
    if (tsb > -15)
      return {
        text: 'Tired',
        color: theme.colors.error,
        advice: 'Building fitness',
      };
    return {
      text: 'Very Tired',
      color: theme.colors.error,
      advice: 'Need recovery',
    };
  };

  const atlInfo = getATLInterpretation(loadAnalysis.acuteTrainingLoad);
  const ctlInfo = getCTLInterpretation(loadAnalysis.chronicTrainingLoad);
  const tsbInfo = getTSBInterpretation(loadAnalysis.trainingStressBalance);

  return (
    <View style={styles.chartSection}>
      <Text style={styles.chartTitle}>Training Load Analysis</Text>
      <View style={styles.loadAnalysisCard}>
        <View style={styles.loadMetricsRow}>
          <TouchableOpacity
            style={styles.loadMetric}
            onPress={() => onMetricPress('ATL')}
          >
            <Text style={styles.loadLabel}>ATL</Text>
            <Text style={styles.loadValue}>
              {loadAnalysis.acuteTrainingLoad}
            </Text>
            <Text style={styles.loadDescription}>Recent fatigue</Text>
            <Text style={[styles.loadInterpretation, { color: atlInfo.color }]}>
              {atlInfo.text}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loadMetric}
            onPress={() => onMetricPress('CTL')}
          >
            <Text style={styles.loadLabel}>CTL</Text>
            <Text style={styles.loadValue}>
              {loadAnalysis.chronicTrainingLoad}
            </Text>
            <Text style={styles.loadDescription}>Fitness level</Text>
            <Text style={[styles.loadInterpretation, { color: ctlInfo.color }]}>
              {ctlInfo.text}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loadMetric}
            onPress={() => onMetricPress('TSB')}
          >
            <Text style={styles.loadLabel}>TSB</Text>
            <Text style={[styles.loadValue, { color: tsbInfo.color }]}>
              {loadAnalysis.trainingStressBalance}
            </Text>
            <Text style={styles.loadDescription}>Freshness</Text>
            <Text style={[styles.loadInterpretation, { color: tsbInfo.color }]}>
              {tsbInfo.text}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.recommendationBox}>
          <Text style={styles.recommendationText}>
            {loadAnalysis.recommendation}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default LoadAnalysis;
