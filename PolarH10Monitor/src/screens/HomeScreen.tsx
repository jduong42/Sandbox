import React from 'react';
import { View, Text, StatusBar } from 'react-native';
import { homeScreenStyles } from '../theme/styles';
import { theme } from '../theme';

const HomeScreen: React.FC = () => {
  return (
    <View style={homeScreenStyles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={theme.colors.background}
      />
      <Text style={homeScreenStyles.title}>PolarH10Monitor Application</Text>
    </View>
  );
};

export default HomeScreen;
