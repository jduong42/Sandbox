import React from 'react';
import { View, Text } from 'react-native';
import { analyticsScreenStyles as styles } from '../../../theme/analyticsScreen';

export const AnalyticsHeader: React.FC = () => {
  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Training Analytics</Text>
      <Text style={styles.headerSubtitle}>Performance insights and trends</Text>
    </View>
  );
};

export default AnalyticsHeader;
