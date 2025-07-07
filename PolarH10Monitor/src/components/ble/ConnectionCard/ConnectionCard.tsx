import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import NativeIcon from '../../common/NativeIcon';
import { Card } from '../../common/Card';
import { theme } from '../../../theme';
import { settingsScreenStyles } from '../../../theme/styles';

interface ConnectionCardProps {
  isConnected: boolean;
  deviceName?: string;
  bluetoothEnabled: boolean;
  onDisconnect?: () => void;
}

export const ConnectionCard: React.FC<ConnectionCardProps> = ({
  isConnected,
  deviceName,
  bluetoothEnabled,
  onDisconnect,
}) => {
  const getStatusText = () => {
    if (isConnected) {
      return `Connected to ${deviceName || 'Unknown Device'}`;
    }
    return bluetoothEnabled ? 'Ready to connect' : 'Bluetooth disabled';
  };

  return (
    <Card>
      <View style={settingsScreenStyles.settingHeader}>
        <NativeIcon
          name={isConnected ? 'bluetooth-connected' : 'bluetooth'}
          size={24}
          color={
            isConnected ? theme.colors.success : theme.colors.textSecondary
          }
          style={settingsScreenStyles.settingIcon}
        />
        <View style={settingsScreenStyles.settingTextContainer}>
          <Text style={settingsScreenStyles.settingTitle}>
            Connection Status
          </Text>
          <Text style={settingsScreenStyles.settingDescription}>
            {getStatusText()}
          </Text>
        </View>
      </View>

      {isConnected && onDisconnect && (
        <TouchableOpacity
          style={settingsScreenStyles.disconnectButton}
          onPress={onDisconnect}
        >
          <Text style={settingsScreenStyles.disconnectButtonText}>
            Disconnect
          </Text>
        </TouchableOpacity>
      )}
    </Card>
  );
};

export default ConnectionCard;
