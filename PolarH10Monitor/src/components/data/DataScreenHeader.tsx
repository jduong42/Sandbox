import React from 'react';
import { View, Text } from 'react-native';
import { dataScreenStyles } from '../../theme/dataScreenStyles';

interface DataScreenHeaderProps {
  title: string;
  subtitle: string;
}

export const DataScreenHeader: React.FC<DataScreenHeaderProps> = ({
  title,
  subtitle,
}) => {
  return (
    <View style={dataScreenStyles.header}>
      <Text style={dataScreenStyles.title}>{title}</Text>
      <Text style={dataScreenStyles.subtitle}>{subtitle}</Text>
    </View>
  );
};
