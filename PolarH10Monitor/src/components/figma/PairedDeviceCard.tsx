import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { figmaTheme as t } from '../../theme/figmaTheme';
import { BLEDevice } from './DeleteDeviceModal';
import { useTheme } from '../../theme/ThemeContext';

interface PairedDeviceCardProps {
  device: BLEDevice;
  onSelect: (deviceId: string) => void;
  onDelete: (device: BLEDevice) => void;
}

export function PairedDeviceCard({
  device,
  onSelect,
  onDelete,
}: PairedDeviceCardProps) {
  const { c } = useTheme();
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: c.surface, borderColor: c.border },
      ]}
    >
      <TouchableOpacity
        style={styles.mainRow}
        onPress={() => onSelect(device.id)}
        activeOpacity={0.7}
      >
        <View
          style={[
            styles.iconBox,
            device.isActive ? styles.iconActive : styles.iconInactive,
          ]}
        >
          <Text style={styles.bluetoothEmoji}>📶</Text>
        </View>

        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text
              style={[styles.deviceName, { color: c.foreground }]}
              numberOfLines={1}
            >
              {device.name}
            </Text>
            {device.isActive && (
              <View style={styles.activeBadge}>
                <Text style={styles.activeBadgeText}>✓ Active</Text>
              </View>
            )}
          </View>
          <Text style={[styles.lastConnected, { color: c.muted }]}>
            {device.lastConnected}
          </Text>
        </View>

        <View style={styles.batteryRow}>
          <Text style={styles.batteryEmoji}>🔋</Text>
          <Text style={[styles.batteryText, { color: c.muted }]}>
            {device.batteryLevel}%
          </Text>
        </View>
      </TouchableOpacity>

      <View style={[styles.divider, { backgroundColor: c.border }]} />
      <TouchableOpacity
        style={styles.deleteRow}
        onPress={() => onDelete(device)}
        activeOpacity={0.7}
      >
        <Text style={styles.deleteEmoji}>🗑️</Text>
        <Text style={styles.deleteText}>Forget Device</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: t.colors.surface,
    borderRadius: t.radius.lg,
    borderWidth: 1,
    borderColor: t.colors.border,
    overflow: 'hidden',
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: t.spacing.lg,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  iconActive: { backgroundColor: t.colors.green },
  iconInactive: { backgroundColor: t.colors.accent },
  bluetoothEmoji: { fontSize: 22 },
  info: { flex: 1, minWidth: 0 },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  deviceName: {
    fontWeight: t.typography.weights.semibold,
    color: t.colors.foreground,
    fontSize: t.typography.sizes.base,
    flexShrink: 1,
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  activeBadgeText: {
    fontSize: t.typography.sizes.xs,
    color: t.colors.green,
    fontWeight: t.typography.weights.medium,
  },
  lastConnected: {
    fontSize: t.typography.sizes.sm,
    color: t.colors.muted,
  },
  batteryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  batteryEmoji: { fontSize: 14 },
  batteryText: {
    fontSize: t.typography.sizes.sm,
    color: t.colors.muted,
  },
  divider: {
    height: 1,
    backgroundColor: t.colors.border,
  },
  deleteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: t.spacing.lg,
    paddingVertical: 12,
    minHeight: 44,
  },
  deleteEmoji: { fontSize: 14 },
  deleteText: {
    fontSize: t.typography.sizes.sm,
    color: t.colors.red,
  },
});
