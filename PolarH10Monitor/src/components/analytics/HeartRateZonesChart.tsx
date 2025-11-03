import React, { useState } from 'react';
import { View, Text, Dimensions } from 'react-native';
import { SafeText } from '../common/SafeText';
import { theme } from '../../theme';
import { ChartData } from '../../types/training';
import { chartComponentStyles as styles } from '../../theme/chartComponents';
import {
  DonutChart,
  ZoneDetailModal,
  HEART_RATE_ZONES,
  ZONE_DETAILS,
  ZoneInfo,
} from './charts';

const { width: screenWidth } = Dimensions.get('window');
const chartWidth = screenWidth - theme.spacing.xl * 2;

interface HeartRateZonesChartProps {
  data: ChartData;
  style?: any;
}

export const HeartRateZonesChart: React.FC<HeartRateZonesChartProps> = ({
  data,
  style,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedZone, setSelectedZone] = useState<number | null>(null);

  // Calculate total time for percentage calculations
  const totalTime = data.data.reduce((sum, point) => sum + point.y, 0);

  // Prepare data for donut chart
  const donutData = data.data.map((point, index) => ({
    value: point.y,
    color: HEART_RATE_ZONES[index]?.color || '#888888',
    label: HEART_RATE_ZONES[index]?.name || `Zone ${index + 1}`,
    zoneIndex: index,
  }));

  const getZoneInfo = (index: number): ZoneInfo => {
    return HEART_RATE_ZONES[index] || HEART_RATE_ZONES[0];
  };

  const handleZonePress = (zoneIndex: number) => {
    setSelectedZone(zoneIndex);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedZone(null);
  };

  return (
    <View style={[styles.chartContainer, style]}>
      <SafeText style={styles.chartTitle}>Time in Heart Rate Zones</SafeText>

      <DonutChart
        data={donutData}
        totalTime={totalTime}
        onZonePress={handleZonePress}
      />

      {selectedZone !== null && (
        <ZoneDetailModal
          visible={modalVisible}
          zoneIndex={selectedZone}
          zoneInfo={getZoneInfo(selectedZone)}
          zoneDetail={ZONE_DETAILS[selectedZone]}
          onClose={closeModal}
        />
      )}
    </View>
  );
};

export default HeartRateZonesChart;
