import React from 'react';
import { View, Text } from 'react-native';
import { Surface } from 'react-native-paper';
import { homeScreenStyles } from '../../theme/homeScreenStyles';

interface HomeHeaderProps {
  welcomeText: string;
  titleText: string;
}

export const HomeHeader: React.FC<HomeHeaderProps> = ({
  welcomeText,
  titleText,
}) => {
  return (
    <Surface style={homeScreenStyles.header} elevation={2}>
      <Text style={homeScreenStyles.welcomeText}>{welcomeText}</Text>
      <Text style={homeScreenStyles.titleText}>{titleText}</Text>
    </Surface>
  );
};
