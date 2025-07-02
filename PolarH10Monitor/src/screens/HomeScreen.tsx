import React from 'react';
import { View, Text, StatusBar, TouchableOpacity } from 'react-native';
import { homeScreenStyles } from '../theme/styles';
import { theme } from '../theme';
import { logger } from '../utils/logger';

const HomeScreen: React.FC = () => {
  const testLogs = () => {
    logger.debug('Debug log test', { timestamp: new Date().toISOString() });
    logger.info('Info log test', { user: 'Juha', action: 'button_press' });
    logger.warn('Warning log test', { reason: 'demonstration' });
    logger.error('Error log test', { severity: 'low', testing: true });
  };

  return (
    <View style={homeScreenStyles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={theme.colors.background}
      />
      <Text style={homeScreenStyles.title}>PolarH10Monitor Application</Text>

      <TouchableOpacity
        style={{
          backgroundColor: theme.colors.primary,
          padding: 15,
          borderRadius: 8,
          marginTop: 20,
        }}
        onPress={testLogs}
      >
        <Text style={{ color: 'white', textAlign: 'center', fontSize: 16 }}>
          Test Structured Logs
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default HomeScreen;
