import React from 'react';
import { View, ViewStyle } from 'react-native';
import { theme } from '../../../theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: 'sm' | 'md' | 'lg';
  shadow?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  padding = 'lg',
  shadow = true,
}) => {
  const cardStyle: ViewStyle = {
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing[padding],
    marginBottom: theme.spacing.md,
    ...(shadow && theme.shadows.small),
    ...style,
  };

  return <View style={cardStyle}>{children}</View>;
};

export default Card;
