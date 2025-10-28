import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { chartComponentStyles as styles } from '../../../theme/chartComponents';

interface ZoneInfo {
  name: string;
  range: string;
  color: string;
  description: string;
}

interface ZoneBarProps {
  zoneInfo: ZoneInfo;
  value: number;
  maxValue: number;
  maxBarWidth: number;
  onPress: () => void;
}

export const ZoneBar: React.FC<ZoneBarProps> = ({
  zoneInfo,
  value,
  maxValue,
  maxBarWidth,
  onPress,
}) => {
  const barWidth = Math.max((value / maxValue) * maxBarWidth, 2);
  const displayValue = Math.round(value);

  return (
    <TouchableOpacity style={styles.zoneContainer} onPress={onPress}>
      <View style={styles.zoneLabel}>
        <View
          style={[styles.zoneColorDot, { backgroundColor: zoneInfo.color }]}
        />
        <Text style={styles.zoneName} numberOfLines={1}>
          {zoneInfo.name}
        </Text>
      </View>

      <View style={styles.barContainer}>
        <View
          style={[
            styles.zoneBar,
            {
              width: barWidth,
              backgroundColor: zoneInfo.color,
            },
          ]}
        >
          {barWidth > 40 && <Text style={styles.barText}>{displayValue}%</Text>}
        </View>
      </View>

      <Text style={styles.zoneValue}>{displayValue} min</Text>
    </TouchableOpacity>
  );
};

export default ZoneBar;
