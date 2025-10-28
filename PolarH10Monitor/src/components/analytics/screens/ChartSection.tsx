import React from 'react';
import { View, Text } from 'react-native';
import { analyticsScreenStyles as styles } from '../../../theme/analyticsScreen';
import { ChartData } from '../../../types/training';

interface ChartSectionProps {
  title: string;
  children: React.ReactNode;
}

export const ChartSection: React.FC<ChartSectionProps> = ({
  title,
  children,
}) => {
  return (
    <View style={styles.chartSection}>
      <Text style={styles.chartTitle}>{title}</Text>
      {children}
    </View>
  );
};

export default ChartSection;
