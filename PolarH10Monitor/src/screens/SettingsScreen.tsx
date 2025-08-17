import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import NativeIcon from '../components/common/NativeIcon';
import { theme } from '../theme';
import { settingsScreenStyles } from '../theme/styles';
import { useBLEScanning, useDeviceHistory } from '../hooks';
import { DeviceHistoryCard } from '../components/ble/SimpleDeviceHistoryCard';
import { StoredDevice, deviceHistoryService } from '../services';
import { logger } from '../utils/logger';
import { simplifiedTextGenerationService } from '../services/SimplifiedTextGenerationService';

const SettingsScreen: React.FC = () => {
  const [onnxTestResult, setOnnxTestResult] = useState<string>('');
  const [onnxTesting, setOnnxTesting] = useState(false);

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

  const {
    devices: deviceHistory,
    loading: historyLoading,
    error: historyError,
    refreshDevices,
    removeDevice,
    clearAllDevices,
  } = useDeviceHistory();

  // Refresh device history when connection status changes
  useEffect(() => {
    if (isConnected) {
      // Small delay to ensure the device has been added to history
      const timer = setTimeout(() => {
        refreshDevices();
      }, 1000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isConnected, refreshDevices]);

  const handleHistoryDeviceSelect = async (device: StoredDevice) => {
    try {
      if (isConnected) {
        Alert.alert(
          'Already Connected',
          'You are already connected to a device. Would you like to disconnect and connect to this device?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Connect',
              onPress: async () => {
                await disconnectDevice();
                await connectToDevice(device.id, device.name);
                // Refresh device history after connection
                setTimeout(() => refreshDevices(), 1500);
              },
            },
          ],
        );
      } else {
        await connectToDevice(device.id, device.name);
        // Refresh device history after connection
        setTimeout(() => refreshDevices(), 1500);
      }
    } catch (error) {
      Alert.alert(
        'Connection Failed',
        'Could not connect to the device. Please make sure it is nearby and powered on.',
        [{ text: 'OK' }],
      );
    }
  };

  const runONNXQuickTest = async () => {
    setOnnxTesting(true);
    setOnnxTestResult('🤖 Initializing ONNX service...');

    try {
      await simplifiedTextGenerationService.initialize();
      setOnnxTestResult('✅ ONNX initialized! Testing sports question...');

      const question = 'What is a good heart rate for moderate exercise?';
      const startTime = Date.now();

      const response =
        await simplifiedTextGenerationService.generateSportsAdvice(
          question,
          100, // maxTokens
        );

      const endTime = Date.now();
      setOnnxTestResult(
        `💬 Response: "${response.generatedText}"\n⏱️ Time: ${
          endTime - startTime
        }ms\n🎉 Test completed!`,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      setOnnxTestResult(`❌ Error: ${errorMessage}`);
      logger.error('ONNX Test Error:', error);
    } finally {
      setOnnxTesting(false);
    }
  };

  const handleDeviceConnect = async (deviceId: string, deviceName: string) => {
    try {
      await connectToDevice(deviceId, deviceName);
      // Refresh device history after connection
      setTimeout(() => refreshDevices(), 1500);
    } catch (error) {
      // Error handling is already done in the connectToDevice function
    }
  };

  return (
    <ScrollView style={settingsScreenStyles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={theme.colors.background}
      />

      {/* Device History Card */}
      <DeviceHistoryCard
        devices={deviceHistory}
        loading={historyLoading}
        error={historyError}
        onDeviceSelect={handleHistoryDeviceSelect}
        onDeviceRemove={removeDevice}
        onClearAll={clearAllDevices}
        onRefresh={refreshDevices}
      />

      {/* Connection Status Card */}
      <View style={settingsScreenStyles.settingCard}>
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
          <NativeIcon
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

      {/* ONNX AI Model Test Card */}
      <View style={settingsScreenStyles.settingCard}>
        <View style={settingsScreenStyles.settingHeader}>
          <NativeIcon
            name="stats-chart"
            size={24}
            color={theme.colors.textSecondary}
            style={settingsScreenStyles.settingIcon}
          />
          <View style={settingsScreenStyles.settingTextContainer}>
            <Text style={settingsScreenStyles.settingTitle}>
              🧠 AI Model Test
            </Text>
            <Text style={settingsScreenStyles.settingDescription}>
              Test the sports science AI model{'\n'}with a quick question.
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[
            settingsScreenStyles.scanButton,
            onnxTesting && settingsScreenStyles.scanButtonDisabled,
          ]}
          onPress={runONNXQuickTest}
          disabled={onnxTesting}
        >
          <Text style={settingsScreenStyles.scanButtonText}>
            {onnxTesting ? '🤖 Testing...' : '🚀 Test AI Model'}
          </Text>
        </TouchableOpacity>

        {onnxTestResult ? (
          <View
            style={{
              marginTop: 15,
              padding: 10,
              backgroundColor: '#f5f5f5',
              borderRadius: 8,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                color: theme.colors.textSecondary,
                lineHeight: 18,
              }}
            >
              {onnxTestResult}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Known Devices Card */}
      {discoveredDevices.length > 0 && (
        <View style={settingsScreenStyles.settingCard}>
          <View style={settingsScreenStyles.settingHeader}>
            <NativeIcon
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
                onPress={() => handleDeviceConnect(device.id, device.name)}
              >
                <View style={settingsScreenStyles.deviceInfo}>
                  <Text style={settingsScreenStyles.deviceName}>
                    {device.name}
                  </Text>
                  <Text style={settingsScreenStyles.deviceId}>{device.id}</Text>
                </View>
                <NativeIcon
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
