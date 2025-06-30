import React from 'react';
import { View, Text, StatusBar } from 'react-native';
import { theme } from '../theme';
import { smlScreenStyles } from '../theme/styles';

const SMLScreen: React.FC = () => {
  return (
    <View style={smlScreenStyles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={theme.colors.background}
      />
      <Text style={smlScreenStyles.title}>Small Language Model</Text>
    </View>
  );
};

export default SMLScreen;
