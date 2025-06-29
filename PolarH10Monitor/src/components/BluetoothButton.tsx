import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { theme } from '../theme';
import { bluetoothButtonStyles } from '../theme/styles';

interface BluetoothButtonProps {
  onPress: () => void;
  title?: string;
  disabled?: boolean;
  loading?: boolean;
  connected?: boolean;
}

const BluetoothButton: React.FC<BluetoothButtonProps> = ({
  onPress,
  title = 'Connect to Bluetooth',
  disabled = false,
  loading = false,
  connected = false,
}) => {
  const getButtonStyle = () => {
    if (disabled || loading) {
      return [
        bluetoothButtonStyles.button,
        bluetoothButtonStyles.buttonDisabled,
      ];
    }
    if (connected) {
      return [
        bluetoothButtonStyles.button,
        bluetoothButtonStyles.buttonConnected,
      ];
    }
    return [bluetoothButtonStyles.button, bluetoothButtonStyles.buttonDefault];
  };

  const getIconColor = () => {
    if (disabled || loading) {
      return theme.colors.textTertiary;
    }
    if (connected) {
      return theme.colors.white;
    }
    return theme.colors.white;
  };

  const getTextColor = () => {
    if (disabled || loading) {
      return theme.colors.textTertiary;
    }
    return theme.colors.white;
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      <View style={bluetoothButtonStyles.buttonContent}>
        <Icon
          name={connected ? 'bluetooth-connected' : 'bluetooth'}
          size={24}
          color={getIconColor()}
          style={bluetoothButtonStyles.icon}
        />
        <Text
          style={[bluetoothButtonStyles.buttonText, { color: getTextColor() }]}
        >
          {loading ? 'Connecting...' : title}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default BluetoothButton;
