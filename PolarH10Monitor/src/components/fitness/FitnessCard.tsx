import React from 'react';
import { View, Text, ViewStyle, TextStyle } from 'react-native';
import { Card, Surface } from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import { theme } from '../../theme';

interface FitnessCardProps {
  title: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  style?: ViewStyle;
  gradient?: boolean;
  onPress?: () => void;
  backgroundColor?: string;
  textColor?: string;
}

const FitnessCard: React.FC<FitnessCardProps> = ({
  title,
  value,
  unit,
  subtitle,
  icon,
  style,
  gradient = false,
  onPress,
  backgroundColor,
  textColor = theme.colors.text,
}) => {
  const cardContent = (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: textColor }]}>{title}</Text>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
      </View>

      <View style={styles.valueContainer}>
        <Text style={[styles.value, { color: textColor }]}>{value}</Text>
        {unit && (
          <Text style={[styles.unit, { color: textColor }]}>{unit}</Text>
        )}
      </View>

      {subtitle && (
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          {subtitle}
        </Text>
      )}
    </View>
  );

  if (gradient) {
    return (
      <Card style={[styles.card, style]} onPress={onPress} mode="contained">
        <LinearGradient
          colors={[
            theme.colors.primaryGradientStart,
            theme.colors.primaryGradientEnd,
          ]}
          style={styles.gradientContainer}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {cardContent}
        </LinearGradient>
      </Card>
    );
  }

  return (
    <Card
      style={[styles.card, backgroundColor && { backgroundColor }, style]}
      onPress={onPress}
      mode="contained"
    >
      <Card.Content style={styles.cardContent}>{cardContent}</Card.Content>
    </Card>
  );
};

const styles = {
  card: {
    marginVertical: theme.spacing.xs,
    marginHorizontal: theme.spacing.sm,
    elevation: 4,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.surface,
  },
  gradientContainer: {
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
  },
  cardContent: {
    padding: theme.spacing.xs,
  },
  container: {
    padding: theme.spacing.xs,
  },
  header: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: theme.spacing.sm,
  },
  title: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium as TextStyle['fontWeight'],
    color: theme.colors.textSecondary,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  iconContainer: {
    padding: theme.spacing.xs,
  },
  valueContainer: {
    flexDirection: 'row' as const,
    alignItems: 'baseline' as const,
    marginBottom: theme.spacing.xs,
  },
  value: {
    fontSize: theme.typography.sizes.xxl,
    fontWeight: theme.typography.weights.bold as TextStyle['fontWeight'],
    color: theme.colors.text,
  },
  unit: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.medium as TextStyle['fontWeight'],
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
  },
};

export default FitnessCard;
