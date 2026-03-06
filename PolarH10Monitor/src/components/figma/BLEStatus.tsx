import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import NativeIcon from '../common/NativeIcon';
import { useTheme } from '../../theme/ThemeContext';

interface BLEStatusProps {
  isConnected: boolean;
  deviceName: string;
  batteryLevel: number;
  onConnect: () => void;
}

export function BLEStatus({
  isConnected,
  deviceName,
  batteryLevel,
  onConnect,
}: BLEStatusProps) {
  const { c } = useTheme();
  return (
    <View
      style={[
        styles.container,
        isConnected
          ? { backgroundColor: c.connectedBg, borderColor: c.connectedBorder }
          : { backgroundColor: c.surface, borderColor: c.border },
      ]}
    >
      <View style={styles.row}>
        <View style={styles.left}>
          <View
            style={[
              styles.iconBox,
              isConnected
                ? styles.iconConnected
                : { backgroundColor: c.accent },
            ]}
          >
            <NativeIcon name="bluetooth" size={24} color="#ffffff" />
          </View>
          <View>
            <Text style={[styles.deviceName, { color: c.foreground }]}>
              {isConnected ? deviceName : 'No Device'}
            </Text>
            <View style={styles.statusRow}>
              <View
                style={[
                  styles.dot,
                  isConnected ? styles.dotConnected : styles.dotDisconnected,
                ]}
              />
              <Text
                style={[
                  styles.statusText,
                  { color: isConnected ? c.connectedText : c.muted },
                ]}
              >
                {isConnected ? 'Connected' : 'Disconnected'}
              </Text>
            </View>
          </View>
        </View>

        {isConnected ? (
          <View style={styles.batteryRow}>
            <Text style={styles.batteryIcon}>🔋</Text>
            <Text style={[styles.batteryText, { color: c.foreground }]}>
              {batteryLevel}%
            </Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.connectButton}
            onPress={onConnect}
            activeOpacity={0.8}
          >
            <Text style={styles.connectButtonText}>Connect</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  connected: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  disconnected: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderColor: 'rgba(51, 65, 85, 0.5)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconConnected: {
    backgroundColor: '#22c55e',
  },
  iconDisconnected: {
    backgroundColor: '#334155',
  },
  deviceName: {
    fontWeight: '600',
    color: '#ffffff',
    fontSize: 15,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotConnected: {
    backgroundColor: '#4ade80',
  },
  dotDisconnected: {
    backgroundColor: '#64748b',
  },
  statusText: {
    fontSize: 14,
  },
  statusConnected: {
    color: '#86efac',
  },
  statusDisconnected: {
    color: '#cbd5e1',
  },
  batteryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  batteryIcon: {
    fontSize: 14,
  },
  batteryText: {
    fontSize: 14,
    color: '#e2e8f0',
  },
  connectButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    minHeight: 44,
    justifyContent: 'center',
  },
  connectButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
});
