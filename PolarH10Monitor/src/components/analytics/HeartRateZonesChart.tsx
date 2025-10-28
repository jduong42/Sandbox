import React, { useState } from 'react';
import { View, Text, Dimensions } from 'react-native';
import { theme } from '../../theme';
import { ChartData } from '../../types/training';
import { chartComponentStyles as styles } from '../../theme/chartComponents';
import {
  ZoneBar,
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

  const maxValue = Math.max(...data.data.map(point => point.y));
  const maxBarWidth = chartWidth - 200; // 110px labels + 90px for minutes

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
      <Text style={styles.chartTitle}>Time in Heart Rate Zones</Text>
      
      {data.data.map((point, index) => (
        <ZoneBar
          key={index}
          zoneInfo={getZoneInfo(index)}
          value={point.y}
          maxValue={maxValue}
          maxBarWidth={maxBarWidth}
          onPress={() => handleZonePress(index)}
        />
      ))}

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
