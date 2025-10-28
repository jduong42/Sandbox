import React from 'react';
import { View, Text } from 'react-native';
import { Surface } from 'react-native-paper';
import NativeIcon from '../common/NativeIcon';
import { dataScreenStyles } from '../../theme/dataScreenStyles';
import { colors } from '../../theme/colors';

interface HeartRateDisplayCardProps {
  currentHeartRate?: number | null;
  isMonitoring: boolean;
}

export const HeartRateDisplayCard: React.FC<HeartRateDisplayCardProps> = ({
  currentHeartRate,
  isMonitoring,
}) => {
  return (
    <Surface style={dataScreenStyles.card} elevation={3}>
      <View style={dataScreenStyles.heartRateCard}>
        <View style={dataScreenStyles.heartRateHeader}>
          <NativeIcon name="heart" size={24} color={colors.primary} />
          <Text style={dataScreenStyles.cardTitle}>Current Heart Rate</Text>
        </View>
        <View style={dataScreenStyles.heartRateDisplay}>
          <Text style={dataScreenStyles.heartRateValue}>
            {currentHeartRate || '--'}
          </Text>
          <Text style={dataScreenStyles.heartRateUnit}>BPM</Text>
        </View>
        <Text style={dataScreenStyles.heartRateStatus}>
          {isMonitoring ? '🟢 Monitoring active' : '🔴 Monitoring stopped'}
        </Text>
      </View>
    </Surface>
  );
};
