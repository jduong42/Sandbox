import React from 'react';
import { View, Text, StatusBar } from 'react-native';
import { theme } from '../theme';
import { dataScreenStyles } from '../theme/styles';

const DataScreen: React.FC = () => {
  return (
    <View style={dataScreenStyles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={theme.colors.background}
      />
      <Text style={dataScreenStyles.title}>Data</Text>
    </View>
  );
};

export default DataScreen;
