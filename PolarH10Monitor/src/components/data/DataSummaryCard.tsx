import React from 'react';
import { View, Text } from 'react-native';
import { Surface } from 'react-native-paper';
import NativeIcon from '../common/NativeIcon';
import { dataScreenStyles } from '../../theme/dataScreenStyles';
import { colors } from '../../theme/colors';
import { HeartRateReading } from '../../services/HeartRateService';

interface DataSummaryCardProps {
  readings: HeartRateReading[];
  isMonitoring: boolean;
}

export const DataSummaryCard: React.FC<DataSummaryCardProps> = ({
  readings,
  isMonitoring,
}) => {
  const maxHeartRate =
    readings.length > 0 ? Math.max(...readings.map(r => r.heartRate)) : '--';

  return (
    <Surface style={dataScreenStyles.card} elevation={3}>
      <View style={dataScreenStyles.summaryCard}>
        <Text style={dataScreenStyles.cardTitle}>Session Summary</Text>
        <View style={dataScreenStyles.summaryGrid}>
          <View style={dataScreenStyles.summaryItem}>
            <NativeIcon name="pulse" size={20} color={colors.primary} />
            <Text style={dataScreenStyles.summaryValue}>{readings.length}</Text>
            <Text style={dataScreenStyles.summaryLabel}>Readings</Text>
          </View>
          <View style={dataScreenStyles.summaryItem}>
            <NativeIcon name="timer" size={20} color={colors.primary} />
            <Text style={dataScreenStyles.summaryValue}>
              {isMonitoring ? 'Active' : 'Stopped'}
            </Text>
            <Text style={dataScreenStyles.summaryLabel}>Status</Text>
          </View>
          <View style={dataScreenStyles.summaryItem}>
            <NativeIcon name="trending-up" size={20} color={colors.primary} />
            <Text style={dataScreenStyles.summaryValue}>{maxHeartRate}</Text>
            <Text style={dataScreenStyles.summaryLabel}>Max BPM</Text>
          </View>
        </View>
      </View>
    </Surface>
  );
};
