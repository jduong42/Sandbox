import React from 'react';
import { View, Text } from 'react-native';
import NativeIcon from '../common/NativeIcon';
import { trainingDataStyles } from '../../theme/trainingDataStyles';
import { colors } from '../../theme/colors';

interface ConnectionStatusCardProps {
  isConnected: boolean;
  connectedDeviceName?: string;
  bluetoothEnabled: boolean;
}

export const ConnectionStatusCard: React.FC<ConnectionStatusCardProps> = ({
  isConnected,
  connectedDeviceName,
  bluetoothEnabled,
}) => {
  return (
    <View
      style={[
        trainingDataStyles.connectionStatus,
        isConnected
          ? trainingDataStyles.connectionStatusConnected
          : trainingDataStyles.connectionStatusDisconnected,
      ]}
    >
      <NativeIcon
        name={isConnected ? 'bluetooth-connected' : 'bluetooth-disabled'}
        size={20}
        color={isConnected ? colors.success : colors.error}
      />
      <Text
        style={[
          trainingDataStyles.connectionStatusText,
          isConnected
            ? trainingDataStyles.connectionStatusTextConnected
            : trainingDataStyles.connectionStatusTextDisconnected,
        ]}
      >
        {isConnected
          ? `Connected to ${connectedDeviceName || 'Device'}`
          : bluetoothEnabled
          ? 'Not connected to any device'
          : 'Bluetooth is disabled'}
      </Text>
    </View>
  );
};
