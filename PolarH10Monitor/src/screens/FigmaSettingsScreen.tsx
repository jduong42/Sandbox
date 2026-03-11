import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { figmaTheme as t } from '../theme/figmaTheme';
import { useTheme } from '../theme/ThemeContext';
import { PairedDeviceCard } from '../components/figma/PairedDeviceCard';
import {
  DeleteDeviceModal,
  BLEDevice,
} from '../components/figma/DeleteDeviceModal';
import {
  ScanDevicesModal,
  NearbyDevice,
} from '../components/figma/ScanDevicesModal';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { deviceHistoryService } from '../services/DeviceHistoryService';
import { bleService } from '../services/BLEService';
import { useBLEScanning } from '../hooks/useBLEScanning';

export function FigmaSettingsScreen() {
  const { isDark, toggleTheme, c } = useTheme();
  const { user } = useAuth();
  const { isConnected, connectedDeviceName, startScan, discoveredDevices, isScanning } =
    useBLEScanning();
  const [devices, setDevices] = useState<BLEDevice[]>([]);
  const [deviceToDelete, setDeviceToDelete] = useState<BLEDevice | null>(null);
  const [showScanModal, setShowScanModal] = useState(false);

  const loadDevices = useCallback(async () => {
    try {
      const stored = await deviceHistoryService.getDevices();
      setDevices(
        stored.map(d => ({
          id: d.id,
          name: d.name,
          batteryLevel: 0, // Battery not tracked by BLE history
          isActive: isConnected && connectedDeviceName === d.name,
          lastConnected: deviceHistoryService.getFormattedLastConnected(
            d.lastConnected,
          ),
        })),
      );
    } catch (e) {
      console.warn('[SettingsScreen] failed to load devices', e);
    }
  }, [isConnected, connectedDeviceName]);

  useFocusEffect(
    useCallback(() => {
      loadDevices();
    }, [loadDevices]),
  );

  const handleSelectDevice = async (deviceId: string) => {
    const target = devices.find(d => d.id === deviceId);
    if (!target) return;
    try {
      await bleService.connectToDevice(deviceId);
      await loadDevices();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Connection failed';
      Alert.alert('Connection Failed', msg);
    }
  };

  const handleDeleteDevice = (device: BLEDevice) => {
    setDeviceToDelete(device);
  };

  const confirmDeleteDevice = async () => {
    if (!deviceToDelete) return;
    try {
      await deviceHistoryService.removeDevice(deviceToDelete.id);
      setDeviceToDelete(null);
      await loadDevices();
    } catch (err) {
      Alert.alert('Error', 'Could not remove device.');
    }
  };

  const handlePairDevice = async (nearbyDevice: NearbyDevice) => {
    setShowScanModal(false);
    try {
      await bleService.connectToDevice(nearbyDevice.id);
      await loadDevices();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Pairing failed';
      Alert.alert('Pairing Failed', msg);
    }
  };

  return (
    <LinearGradient colors={c.background} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={[styles.title, { color: c.foreground }]}>
                Settings
              </Text>
              <Text style={[styles.subtitle, { color: c.muted }]}>
                Manage your devices and preferences
              </Text>
            </View>
            <TouchableOpacity style={styles.avatar}>
              <Text style={styles.avatarText}>{user?.avatar ?? 'A'}</Text>
            </TouchableOpacity>
          </View>

          {/* Appearance */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: c.foreground }]}>
              Appearance
            </Text>
            <TouchableOpacity
              style={[
                styles.themeRow,
                { backgroundColor: c.surface, borderColor: c.border },
              ]}
              onPress={toggleTheme}
              activeOpacity={0.75}
            >
              <View
                style={[
                  styles.themeIconBox,
                  { backgroundColor: isDark ? c.accent : c.amberTint },
                ]}
              >
                <Text style={styles.themeEmoji}>{isDark ? '🌙' : '☀️'}</Text>
              </View>
              <View style={styles.themeInfo}>
                <Text style={[styles.themeLabel, { color: c.foreground }]}>
                  Theme
                </Text>
                <Text style={[styles.themeValue, { color: c.muted }]}>
                  {isDark ? 'Dark mode' : 'Light mode'}
                </Text>
              </View>
              <Text style={[styles.chevron, { color: c.muted }]}>
                {isDark ? '🌑' : '🔆'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Bluetooth Devices */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitleInRow, { color: c.foreground }]}>
                Bluetooth Devices
              </Text>
              <View style={styles.devicesCountRow}>
                <Text style={styles.countEmoji}>📶</Text>
                <Text style={[styles.countText, { color: c.muted }]}>
                  {devices.length} paired
                </Text>
              </View>
            </View>

            {/* Scan button */}
            <TouchableOpacity
              onPress={() => setShowScanModal(true)}
              activeOpacity={0.8}
              style={styles.scanBtnWrapper}
            >
              <View style={styles.scanBtnInner}>
                <LinearGradient
                  colors={[t.colors.primary, t.colors.primaryTo]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.scanBtn}
                >
                  <Text style={styles.scanBtnIcon}>+</Text>
                  <Text style={styles.scanBtnText}>Scan for Devices</Text>
                </LinearGradient>
              </View>
            </TouchableOpacity>

            {/* Device list */}
            {devices.length > 0 ? (
              <View style={styles.deviceList}>
                {devices.map(device => (
                  <PairedDeviceCard
                    key={device.id}
                    device={device}
                    onSelect={handleSelectDevice}
                    onDelete={handleDeleteDevice}
                  />
                ))}
              </View>
            ) : (
              <View style={styles.emptyDevices}>
                <Text style={styles.emptyEmoji}>📡</Text>
                <Text style={styles.emptyTitle}>No paired devices</Text>
                <Text style={styles.emptySub}>
                  Scan to find nearby Bluetooth devices
                </Text>
              </View>
            )}
          </View>

          {/* App Info */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: c.foreground }]}>
              About
            </Text>
            <View
              style={[
                styles.infoCard,
                { backgroundColor: c.surface, borderColor: c.border },
              ]}
            >
              {[
                { label: 'App Version', value: '1.0.0' },
                { label: 'AI Model', value: 'model_q4km' },
                { label: 'Runtime', value: 'llama.rn (on-device)' },
              ].map(row => (
                <View
                  key={row.label}
                  style={[styles.infoRow, { borderBottomColor: c.border }]}
                >
                  <Text style={[styles.infoLabel, { color: c.muted }]}>
                    {row.label}
                  </Text>
                  <Text style={[styles.infoValue, { color: c.foreground }]}>
                    {row.value}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>

      {showScanModal && (
        <ScanDevicesModal
          onClose={() => setShowScanModal(false)}
          onSelectDevice={handlePairDevice}
          existingDeviceIds={devices.map(d => d.id)}
          discoveredDevices={discoveredDevices}
          isScanning={isScanning}
          onStartScan={startScan}
        />
      )}

      {deviceToDelete && (
        <DeleteDeviceModal
          device={deviceToDelete}
          onConfirm={confirmDeleteDevice}
          onCancel={() => setDeviceToDelete(null)}
        />
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: t.spacing.xl,
    paddingTop: t.spacing.xl,
    marginBottom: t.spacing.xl,
  },
  title: {
    fontSize: t.typography.sizes.xxl,
    fontWeight: t.typography.weights.semibold,
    color: t.colors.foreground,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: t.typography.sizes.sm,
    color: t.colors.muted,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: t.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: t.typography.weights.semibold,
    color: '#fff',
  },
  section: {
    paddingHorizontal: t.spacing.xl,
    marginBottom: t.spacing.xxl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: t.spacing.lg,
  },
  sectionTitle: {
    fontSize: t.typography.sizes.lg,
    fontWeight: t.typography.weights.semibold,
    color: t.colors.foreground,
    marginBottom: t.spacing.lg,
  },
  sectionTitleInRow: {
    fontSize: t.typography.sizes.lg,
    fontWeight: t.typography.weights.semibold,
    color: t.colors.foreground,
  },
  devicesCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  countEmoji: { fontSize: 14 },
  countText: {
    fontSize: t.typography.sizes.sm,
    color: t.colors.muted,
  },
  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: t.colors.surface,
    borderRadius: t.radius.lg,
    borderWidth: 1,
    borderColor: t.colors.border,
    padding: t.spacing.lg,
    gap: 12,
  },
  themeIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: t.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeEmoji: { fontSize: 22 },
  themeInfo: { flex: 1 },
  themeLabel: {
    fontWeight: t.typography.weights.semibold,
    color: t.colors.foreground,
    fontSize: t.typography.sizes.base,
  },
  themeValue: {
    fontSize: t.typography.sizes.sm,
    color: t.colors.muted,
    marginTop: 2,
  },
  chevron: {
    fontSize: 20,
    color: t.colors.muted,
  },
  scanBtnWrapper: {
    marginBottom: t.spacing.lg,
  },
  scanBtnInner: {
    borderRadius: t.radius.lg,
    overflow: 'hidden',
    height: 52,
  },
  scanBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  scanBtnIcon: {
    color: '#fff',
    fontSize: 20,
    fontWeight: t.typography.weights.bold,
    lineHeight: 22,
  },
  scanBtnText: {
    color: '#fff',
    fontSize: t.typography.sizes.base,
    fontWeight: t.typography.weights.semibold,
  },
  deviceList: { gap: 12 },
  emptyDevices: {
    backgroundColor: t.colors.surface,
    borderRadius: t.radius.lg,
    borderWidth: 1,
    borderColor: t.colors.border,
    padding: 32,
    alignItems: 'center',
  },
  emptyEmoji: { fontSize: 36, marginBottom: t.spacing.md },
  emptyTitle: {
    color: t.colors.muted,
    fontSize: t.typography.sizes.sm,
    fontWeight: t.typography.weights.medium,
  },
  emptySub: {
    color: t.colors.muted,
    fontSize: t.typography.sizes.xs,
    marginTop: 4,
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: t.colors.surface,
    borderRadius: t.radius.lg,
    borderWidth: 1,
    borderColor: t.colors.border,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: t.spacing.lg,
    paddingVertical: t.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: t.colors.border,
  },
  infoLabel: {
    fontSize: t.typography.sizes.sm,
    color: t.colors.muted,
  },
  infoValue: {
    fontSize: t.typography.sizes.sm,
    color: t.colors.foreground,
    fontWeight: t.typography.weights.medium,
  },
});
