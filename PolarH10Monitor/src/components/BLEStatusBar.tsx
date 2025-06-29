import React from 'react';
import { View, Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { theme } from '../theme';
import { bleStatusBarStyles } from '../theme/styles';

interface BLEStatusBarProps {
  isConnected: boolean;
  deviceName?: string;
  isScanning?: boolean;
  bluetoothEnabled: boolean;
}

const BLEStatusBar: React.FC<BLEStatusBarProps> = ({
  isConnected,
  deviceName,
  isScanning = false,
  bluetoothEnabled,
}) => {
  const getStatusText = () => {
    if (!bluetoothEnabled) {
      return 'Bluetooth Disabled';
    }
    if (isConnected && deviceName) {
      return `Connected to ${deviceName}`;
    }
    if (isScanning) {
      return 'Scanning for devices...';
    }
    return 'Ready to scan';
  };

  const getStatusColor = () => {
    if (!bluetoothEnabled) {
      return theme.colors.error;
    }
    if (isConnected) {
      return theme.colors.success;
    }
    if (isScanning) {
      return theme.colors.info;
    }
    return theme.colors.textSecondary;
  };

  const getIconName = () => {
    if (!bluetoothEnabled) {
      return 'bluetooth-disabled';
    }
    if (isConnected) {
      return 'bluetooth-connected';
    }
    if (isScanning) {
      return 'bluetooth-searching';
    }
    return 'bluetooth';
  };

  return (
    <View style={[bleStatusBarStyles.container, { backgroundColor: getStatusColor() }]}>
      <Icon
        name={getIconName()}
        size={16}
        color={theme.colors.white}
        style={bleStatusBarStyles.icon}
      />
      <Text style={bleStatusBarStyles.statusText}>
        {getStatusText()}
      </Text>
    </View>
  );
};

export default BLEStatusBar;
