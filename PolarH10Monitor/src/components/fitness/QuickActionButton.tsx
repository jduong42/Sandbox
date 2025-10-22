import React from 'react';
import { View, Text, TouchableOpacity, ViewStyle } from 'react-native';
import { Surface } from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import { theme } from '../../theme';

interface QuickActionButtonProps {
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  onPress: () => void;
  style?: ViewStyle;
  variant?: 'primary' | 'secondary' | 'success' | 'warning';
  disabled?: boolean;
}

const QuickActionButton: React.FC<QuickActionButtonProps> = ({
  title,
  subtitle,
  icon,
  onPress,
  style,
  variant = 'primary',
  disabled = false,
}) => {
  const getGradientColors = () => {
    switch (variant) {
      case 'primary':
        return [theme.colors.primary, theme.colors.primaryDark];
      case 'secondary':
        return [theme.colors.secondary, '#FF4520'];
      case 'success':
        return [theme.colors.success, '#00CC70'];
      case 'warning':
        return [theme.colors.warning, '#E69500'];
      default:
        return [theme.colors.primary, theme.colors.primaryDark];
    }
  };

  const getTextColor = () => {
    return variant === 'primary'
      ? theme.colors.textOnPrimary
      : theme.colors.text;
  };

  return (
    <Surface style={[styles.container, style]} elevation={disabled ? 1 : 5}>
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        style={styles.touchable}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={
            disabled
              ? [theme.colors.surfaceVariant, theme.colors.surface]
              : getGradientColors()
          }
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0.8 }}
        >
          <View style={styles.content}>
            <View style={styles.iconContainer}>{icon}</View>
            <View style={styles.textContainer}>
              <Text
                style={[
                  styles.title,
                  {
                    color: disabled
                      ? theme.colors.textTertiary
                      : getTextColor(),
                  },
                ]}
              >
                {title}
              </Text>
              {subtitle && (
                <Text
                  style={[
                    styles.subtitle,
                    {
                      color: disabled
                        ? theme.colors.textTertiary
                        : theme.colors.textSecondary,
                    },
                  ]}
                >
                  {subtitle}
                </Text>
              )}
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Surface>
  );
};

const styles = {
  container: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden' as const,
    margin: theme.spacing.xs,
  },
  touchable: {
    width: '100%' as const,
  },
  gradient: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  content: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  iconContainer: {
    marginRight: theme.spacing.md,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.typography.sizes.sm,
  },
};

export default QuickActionButton;
