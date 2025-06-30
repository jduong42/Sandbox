import React from 'react';
import {
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { theme } from '../theme';
import { settingsScreenStyles } from '../theme/styles';
import { useBLEScanning } from '../hooks';

const SettingsScreen: React.FC = () => {
  const {
    isScanning,
    isConnected,
    connectedDeviceName,
    bluetoothEnabled,
    discoveredDevices,
    startScan,
    connectToDevice,
    disconnectDevice,
  } = useBLEScanning();

  return (
    <ScrollView style={settingsScreenStyles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={theme.colors.background}
      />

      {/* Connection Status Card */}
      <View style={settingsScreenStyles.settingCard}>
        <View style={settingsScreenStyles.settingHeader}>
          <Icon
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
              {isConnected
                ? `Connected to ${connectedDeviceName || 'Unknown Device'}`
                : bluetoothEnabled
                ? 'Ready to connect'
                : 'Bluetooth disabled'}
            </Text>
          </View>
        </View>

        {isConnected && (
          <TouchableOpacity
            style={settingsScreenStyles.disconnectButton}
            onPress={disconnectDevice}
          >
            <Text style={settingsScreenStyles.disconnectButtonText}>
              Disconnect
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Scan for Devices Card */}
      <View style={settingsScreenStyles.settingCard}>
        <View style={settingsScreenStyles.settingHeader}>
          <Icon
            name="settings"
            size={24}
            color={theme.colors.textSecondary}
            style={settingsScreenStyles.settingIcon}
          />
          <View style={settingsScreenStyles.settingTextContainer}>
            <Text style={settingsScreenStyles.settingTitle}>
              Scan for BLE Devices
            </Text>
            <Text style={settingsScreenStyles.settingDescription}>
              Pressing scan to start scanning{'\n'}BLE Devices at your vicinity.
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[
            settingsScreenStyles.scanButton,
            isScanning && settingsScreenStyles.scanButtonDisabled,
          ]}
          onPress={startScan}
          disabled={isScanning}
        >
          <Text style={settingsScreenStyles.scanButtonText}>
            {isScanning ? 'Scanning...' : 'Scan'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Known Devices Card */}
      {discoveredDevices.length > 0 && (
        <View style={settingsScreenStyles.settingCard}>
          <View style={settingsScreenStyles.settingHeader}>
            <Icon
              name="devices"
              size={24}
              color={theme.colors.textSecondary}
              style={settingsScreenStyles.settingIcon}
            />
            <View style={settingsScreenStyles.settingTextContainer}>
              <Text style={settingsScreenStyles.settingTitle}>
                Discovered Devices ({discoveredDevices.length})
              </Text>
              <Text style={settingsScreenStyles.settingDescription}>
                Tap on a device to connect
              </Text>
            </View>
          </View>

          <View style={settingsScreenStyles.devicesList}>
            {discoveredDevices.map((device, index) => (
              <TouchableOpacity
                key={device.id}
                style={[
                  settingsScreenStyles.deviceItem,
                  index === discoveredDevices.length - 1 &&
                    settingsScreenStyles.deviceItemLast,
                ]}
                onPress={() => connectToDevice(device.id, device.name)}
              >
                <View style={settingsScreenStyles.deviceInfo}>
                  <Text style={settingsScreenStyles.deviceName}>
                    {device.name}
                  </Text>
                  <Text style={settingsScreenStyles.deviceId}>{device.id}</Text>
                </View>
                <Icon
                  name="chevron-right"
                  size={20}
                  color={theme.colors.textSecondary}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
};

export default SettingsScreen;
