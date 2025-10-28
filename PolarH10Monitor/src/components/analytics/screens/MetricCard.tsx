import React from 'react';
import { View, Text } from 'react-native';
import NativeIcon from '../../common/NativeIcon';
import { theme } from '../../../theme';
import { analyticsScreenStyles as styles } from '../../../theme/analyticsScreen';

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon,
}) => {
  return (
    <View style={styles.metricCard}>
      <View style={styles.metricHeader}>
        {icon && (
          <NativeIcon
            name={icon}
            size={24}
            color={theme.colors.primary}
            style={styles.metricIcon}
          />
        )}
        <Text style={styles.metricTitle}>{title}</Text>
      </View>
      <Text style={styles.metricValue}>{value}</Text>
      {subtitle && <Text style={styles.metricSubtitle}>{subtitle}</Text>}
    </View>
  );
};

export default MetricCard;
