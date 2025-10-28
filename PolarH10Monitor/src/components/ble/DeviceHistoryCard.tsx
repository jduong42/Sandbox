import React, { useState, useEffect } from 'react';
import { View, Alert } from 'react-native';
import { deviceHistoryStyles } from '../../theme/deviceHistoryStyles';
import { StoredDevice } from '../../services/DeviceHistoryService';
import { logger } from '../../utils/logger';
import {
  DeviceHistoryHeader,
  DeviceHistoryActions,
  DeviceHistoryStates,
  DeviceList,
} from './deviceHistory';

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
      // In edit mode, show remove confirmation
      Alert.alert(
        'Remove Device',
        `Are you sure you want to remove "${device.name}" from your device history?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Remove',
            style: 'destructive',
            onPress: () => onDeviceRemove(device.id),
          },
        ],
      );
    } else {
      // Normal mode, select device for connection
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
          onPress: onClearAll,
        },
      ],
    );
  };

  const handleToggleEditMode = () => {
    setEditMode(!editMode);
  };

  const handleToggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <View style={deviceHistoryStyles.container}>
      <DeviceHistoryHeader
        isExpanded={isExpanded}
        deviceCount={devices.length}
        onToggleExpanded={handleToggleExpanded}
      />

      {isExpanded && (
        <View style={deviceHistoryStyles.content}>
          <DeviceHistoryStates
            loading={loading}
            error={error}
            isEmpty={!loading && !error && devices.length === 0}
            onRefresh={onRefresh}
          />

          {!loading && !error && devices.length > 0 && (
            <>
              <DeviceHistoryActions
                editMode={editMode}
                onToggleEditMode={handleToggleEditMode}
                onClearAll={handleClearAll}
              />

              <DeviceList
                devices={devices}
                editMode={editMode}
                onDevicePress={handleDevicePress}
              />
            </>
          )}
        </View>
      )}
    </View>
  );
};
