import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { analyticsScreenStyles as styles } from '../../../theme/analyticsScreen';

interface TimeframeSelectorProps {
  selectedTimeframe: 'week' | 'month' | 'quarter';
  onTimeframeChange: (timeframe: 'week' | 'month' | 'quarter') => void;
}

export const TimeframeSelector: React.FC<TimeframeSelectorProps> = ({
  selectedTimeframe,
  onTimeframeChange,
}) => {
  return (
    <View style={styles.timeframeSelector}>
      {(['week', 'month', 'quarter'] as const).map(timeframe => (
        <TouchableOpacity
          key={timeframe}
          style={[
            styles.timeframeButton,
            selectedTimeframe === timeframe && styles.timeframeButtonActive,
          ]}
          onPress={() => onTimeframeChange(timeframe)}
        >
          <Text
            style={[
              styles.timeframeButtonText,
              selectedTimeframe === timeframe &&
                styles.timeframeButtonTextActive,
            ]}
          >
            {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default TimeframeSelector;
