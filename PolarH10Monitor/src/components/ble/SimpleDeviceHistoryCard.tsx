import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { colors } from '../../theme/colors';
import { StoredDevice } from '../../services/DeviceHistoryService';
import { deviceHistoryService } from '../../services/DeviceHistoryService';
import { logger } from '../../utils/logger';

interface DeviceHistoryCardProps {
  devices: StoredDevice[];
  loading: boolean;
  error: string | null;
  onDeviceSelect: (device: StoredDevice) => void;
  onDeviceRemove: (deviceId: string) => void;
  onClearAll: () => void;
  onRefresh: () => void;
}

export const DeviceHistoryCard: React.FC<DeviceHistoryCardProps> = ({
  devices,
  loading,
  error,
  onDeviceSelect,
  onDeviceRemove,
  onClearAll,
  onRefresh,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // Debug logging
  useEffect(() => {
    logger.info('DeviceHistoryCard: Props changed', {
      deviceCount: devices.length,
      loading,
      error,
      devices: devices.map(d => ({ 
        id: d.id.substring(0, 8), 
        name: d.name || 'NO_NAME_IN_DEVICE',
        hasName: !!d.name,
        rawName: d.name,
      })),
    });
  }, [devices, loading, error]);

  const handleDevicePress = (device: StoredDevice) => {
    if (editMode) {
      Alert.alert(
        'Remove Device',
        `Are you sure you want to remove "${device.name || 'Unknown Device'}" from your device history?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Remove', 
            style: 'destructive',
            onPress: () => onDeviceRemove(device.id)
          },
        ]
      );
    } else {
      onDeviceSelect(device);
    }
  };

  const handleClearAll = () => {
    Alert.alert(
      'Clear All Devices',
      'Are you sure you want to remove all devices from your history? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear All', 
          style: 'destructive',
          onPress: onClearAll
        },
      ]
    );
  };

  const renderDeviceItem = (device: StoredDevice) => {
    const formattedTime = deviceHistoryService.getFormattedLastConnected(device.lastConnected);
    
    return (
      <TouchableOpacity
        key={device.id}
        style={[
          styles.deviceItem,
          editMode && styles.deviceItemEditMode
        ]}
        onPress={() => handleDevicePress(device)}
        activeOpacity={0.7}
      >
        <View style={styles.deviceInfo}>
          <Text style={styles.deviceName}>
            {device.name || 'Unknown Device'}
          </Text>
          <Text style={styles.deviceLastConnected}>
            Last connected: {formattedTime}
          </Text>
          <Text style={styles.deviceId} numberOfLines={1}>
            ID: {device.id.substring(0, 8)}...
          </Text>
          <Text style={styles.debugInfo}>
            DEBUG: name="{device.name}" hasName={!!device.name}
          </Text>
        </View>
        
        <View style={styles.deviceActions}>
          <Text style={editMode ? styles.deleteText : styles.chevronText}>
            {editMode ? '🗑️' : '→'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
          <Text style={styles.headerIcon}>📱</Text>
          <Text style={styles.headerTitle}>Remembered Devices</Text>
          {devices.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{devices.length}</Text>
            </View>
          )}
        </View>
        
        <Text style={styles.expandIcon}>
          {isExpanded ? "▲" : "▼"}
        </Text>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.content}>
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.loadingText}>Loading devices...</Text>
            </View>
          )}

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}

          {!loading && !error && devices.length === 0 && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📱</Text>
              <Text style={styles.emptyText}>No remembered devices</Text>
              <Text style={styles.emptySubtext}>
                Connect to a device to see it here for quick reconnection
              </Text>
            </View>
          )}

          {!loading && !error && devices.length > 0 && (
            <>
              <View style={styles.actionsBar}>
                <TouchableOpacity
                  style={[styles.actionButton, editMode && styles.actionButtonActive]}
                  onPress={() => setEditMode(!editMode)}
                >
                  <Text style={[styles.actionButtonText, editMode && styles.actionButtonTextActive]}>
                    {editMode ? '✓ Done' : '✏️ Edit'}
                  </Text>
                </TouchableOpacity>

                {editMode && (
                  <TouchableOpacity
                    style={styles.clearAllButton}
                    onPress={handleClearAll}
                  >
                    <Text style={styles.clearAllButtonText}>🗑️ Clear All</Text>
                  </TouchableOpacity>
                )}
              </View>

              <ScrollView 
                style={styles.devicesList}
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled={true}
              >
                {devices.map(renderDeviceItem)}
              </ScrollView>
            </>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  badge: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  badgeText: {
    fontSize: 12,
    color: colors.white,
    fontWeight: '600',
  },
  expandIcon: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  content: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginLeft: 8,
  },
  errorContainer: {
    padding: 16,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    textAlign: 'center',
    marginBottom: 8,
  },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  actionsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  actionButtonActive: {
    backgroundColor: colors.primary,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  actionButtonTextActive: {
    color: colors.white,
  },
  clearAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.error,
  },
  clearAllButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.error,
  },
  devicesList: {
    maxHeight: 300,
  },
  deviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  deviceItemEditMode: {
    backgroundColor: colors.backgroundSecondary,
  },
  deviceInfo: {
    flex: 1,
    marginRight: 12,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  deviceLastConnected: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  deviceId: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: 'monospace',
    marginBottom: 2,
  },
  debugInfo: {
    fontSize: 10,
    color: 'red',
    fontFamily: 'monospace',
  },
  deviceActions: {
    padding: 4,
  },
  deleteText: {
    fontSize: 20,
    color: colors.error,
  },
  chevronText: {
    fontSize: 20,
    color: colors.textSecondary,
  },
});
