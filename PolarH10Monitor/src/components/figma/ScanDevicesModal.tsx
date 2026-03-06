import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { figmaTheme as t } from '../../theme/figmaTheme';

export interface NearbyDevice {
  id: string;
  name: string;
  signalStrength: 'high' | 'medium' | 'low';
  rssi: number;
}

interface ScanDevicesModalProps {
  onClose: () => void;
  onSelectDevice: (device: NearbyDevice) => void;
  existingDeviceIds: string[];
}

const SIGNAL_EMOJI: Record<NearbyDevice['signalStrength'], string> = {
  high: '📶',
  medium: '📶',
  low: '📶',
};
const SIGNAL_COLOR: Record<NearbyDevice['signalStrength'], string> = {
  high: t.colors.green,
  medium: t.colors.amber,
  low: t.colors.red,
};
const SIGNAL_LABEL: Record<NearbyDevice['signalStrength'], string> = {
  high: 'Strong signal',
  medium: 'Medium signal',
  low: 'Weak signal',
};

const MOCK_DEVICES: NearbyDevice[] = [
  { id: 'nearby-1', name: 'FitBand Ultra', signalStrength: 'high', rssi: -45 },
  {
    id: 'nearby-2',
    name: 'Sport Tracker 3',
    signalStrength: 'medium',
    rssi: -65,
  },
  { id: 'nearby-3', name: 'Pulse Monitor', signalStrength: 'high', rssi: -40 },
  { id: 'nearby-4', name: 'Health Watch', signalStrength: 'low', rssi: -85 },
  {
    id: 'nearby-5',
    name: 'Fitness Band X',
    signalStrength: 'medium',
    rssi: -70,
  },
];

export function ScanDevicesModal({
  onClose,
  onSelectDevice,
  existingDeviceIds,
}: ScanDevicesModalProps) {
  const [isScanning, setIsScanning] = useState(true);
  const [foundDevices, setFoundDevices] = useState<NearbyDevice[]>([]);

  useEffect(() => {
    const available = MOCK_DEVICES.filter(
      d => !existingDeviceIds.includes(d.id),
    );
    const timer = setTimeout(() => {
      setFoundDevices(available);
      setIsScanning(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, [existingDeviceIds]);

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={styles.sheet}>
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.headerLeft}>
                  <View style={styles.btIcon}>
                    <Text style={styles.btEmoji}>📡</Text>
                  </View>
                  <View>
                    <Text style={styles.title}>Nearby Devices</Text>
                    {isScanning && (
                      <Text style={styles.scanningText}>Scanning...</Text>
                    )}
                  </View>
                </View>
                <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                  <Text style={styles.closeBtnText}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* Content */}
              <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
              >
                {isScanning ? (
                  <View style={styles.scanningState}>
                    <ActivityIndicator size="large" color={t.colors.primary} />
                    <Text style={styles.scanTitle}>Searching for devices</Text>
                    <Text style={styles.scanSub}>
                      Please wait while we scan nearby Bluetooth devices...
                    </Text>
                  </View>
                ) : foundDevices.length > 0 ? (
                  <>
                    <Text style={styles.foundCount}>
                      Found {foundDevices.length}{' '}
                      {foundDevices.length === 1 ? 'device' : 'devices'}
                    </Text>
                    {foundDevices.map(device => (
                      <TouchableOpacity
                        key={device.id}
                        style={styles.deviceRow}
                        onPress={() => onSelectDevice(device)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.deviceIcon}>
                          <Text style={styles.deviceEmoji}>📶</Text>
                        </View>
                        <View style={styles.deviceInfo}>
                          <Text style={styles.deviceName}>{device.name}</Text>
                          <Text
                            style={[
                              styles.signalLabel,
                              { color: SIGNAL_COLOR[device.signalStrength] },
                            ]}
                          >
                            {SIGNAL_LABEL[device.signalStrength]}
                          </Text>
                        </View>
                        <Text style={styles.signalEmoji}>
                          {SIGNAL_EMOJI[device.signalStrength]}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </>
                ) : (
                  <View style={styles.emptyState}>
                    <View style={styles.emptyIcon}>
                      <Text style={styles.emptyEmoji}>📡</Text>
                    </View>
                    <Text style={styles.emptyTitle}>No devices found</Text>
                    <Text style={styles.emptySub}>
                      Make sure your devices are turned on and in pairing mode.
                    </Text>
                  </View>
                )}
              </ScrollView>

              {/* Footer */}
              {!isScanning && (
                <View style={styles.footer}>
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={onClose}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.cancelText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: t.colors.surface,
    borderTopLeftRadius: t.radius.xxl,
    borderTopRightRadius: t.radius.xxl,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: t.colors.border,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: t.spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: t.colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  btIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: t.colors.blueTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btEmoji: { fontSize: 18 },
  title: {
    fontSize: t.typography.sizes.xl,
    fontWeight: t.typography.weights.semibold,
    color: t.colors.foreground,
  },
  scanningText: {
    fontSize: t.typography.sizes.sm,
    color: t.colors.muted,
    marginTop: 2,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: t.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: t.colors.foreground,
    fontSize: 16,
  },
  content: {
    padding: t.spacing.xl,
    maxHeight: 400,
  },
  scanningState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  scanTitle: {
    color: t.colors.foreground,
    fontWeight: t.typography.weights.medium,
    fontSize: t.typography.sizes.base,
    marginTop: t.spacing.lg,
    marginBottom: 4,
  },
  scanSub: {
    color: t.colors.muted,
    fontSize: t.typography.sizes.sm,
    textAlign: 'center',
    lineHeight: 18,
  },
  foundCount: {
    fontSize: t.typography.sizes.sm,
    color: t.colors.muted,
    marginBottom: t.spacing.md,
  },
  deviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: t.colors.accent,
    borderRadius: t.radius.md,
    padding: t.spacing.lg,
    marginBottom: t.spacing.sm,
    borderWidth: 1,
    borderColor: t.colors.border,
    minHeight: 72,
  },
  deviceIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: t.colors.blueTint,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  deviceEmoji: { fontSize: 22 },
  deviceInfo: { flex: 1 },
  deviceName: {
    fontWeight: t.typography.weights.semibold,
    color: t.colors.foreground,
    fontSize: t.typography.sizes.base,
  },
  signalLabel: {
    fontSize: t.typography.sizes.sm,
    marginTop: 2,
  },
  signalEmoji: { fontSize: 18 },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: t.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: t.spacing.lg,
  },
  emptyEmoji: { fontSize: 28 },
  emptyTitle: {
    color: t.colors.foreground,
    fontWeight: t.typography.weights.medium,
    fontSize: t.typography.sizes.base,
    marginBottom: 4,
  },
  emptySub: {
    color: t.colors.muted,
    fontSize: t.typography.sizes.sm,
    textAlign: 'center',
  },
  footer: {
    padding: t.spacing.xl,
    borderTopWidth: 1,
    borderTopColor: t.colors.border,
  },
  cancelBtn: {
    backgroundColor: t.colors.accent,
    borderRadius: t.radius.md,
    paddingVertical: 12,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  cancelText: {
    color: t.colors.foreground,
    fontSize: t.typography.sizes.base,
    fontWeight: t.typography.weights.medium,
  },
});
