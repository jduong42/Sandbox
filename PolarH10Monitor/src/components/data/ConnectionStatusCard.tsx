import React from 'react';
import { View, Text } from 'react-native';
import { Surface } from 'react-native-paper';
import NativeIcon from '../common/NativeIcon';
import { dataScreenStyles } from '../../theme/dataScreenStyles';
import { colors } from '../../theme/colors';

interface ConnectionStatusCardProps {
  isConnected: boolean;
  connectedDeviceName?: string;
}

export const ConnectionStatusCard: React.FC<ConnectionStatusCardProps> = ({
  isConnected,
  connectedDeviceName,
}) => {
  return (
    <Surface style={dataScreenStyles.card} elevation={3}>
      <View style={dataScreenStyles.cardHeader}>
        <NativeIcon
          name={isConnected ? 'bluetooth-connected' : 'bluetooth-disabled'}
          size={28}
          color={isConnected ? colors.success : colors.error}
        />
        <View style={dataScreenStyles.cardHeaderText}>
          <Text style={dataScreenStyles.cardTitle}>
            {isConnected ? 'Device Connected' : 'No Connection'}
          </Text>
          <Text style={dataScreenStyles.cardDescription}>
            {isConnected
              ? `${connectedDeviceName || 'Polar Device'}`
              : 'Connect your Polar H10 device'}
          </Text>
        </View>
        <View
          style={[
            dataScreenStyles.statusDot,
            {
              backgroundColor: isConnected ? colors.success : colors.error,
            },
          ]}
        />
      </View>
    </Surface>
  );
};
