import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import NativeIcon from '../../common/NativeIcon';
import { deviceHistoryStyles } from '../../../theme/deviceHistoryStyles';
import { colors } from '../../../theme/colors';
import { StoredDevice } from '../../../services/DeviceHistoryService';
import { deviceHistoryService } from '../../../services/DeviceHistoryService';

interface DeviceItemProps {
  device: StoredDevice;
  editMode: boolean;
  onPress: (device: StoredDevice) => void;
}

export const DeviceItem: React.FC<DeviceItemProps> = ({
  device,
  editMode,
  onPress,
}) => {
  const formattedTime = deviceHistoryService.getFormattedLastConnected(
    device.lastConnected,
  );

  return (
    <TouchableOpacity
      style={[
        deviceHistoryStyles.deviceItem,
        editMode && deviceHistoryStyles.deviceItemEditMode,
      ]}
      onPress={() => onPress(device)}
      activeOpacity={0.7}
    >
      <View style={deviceHistoryStyles.deviceInfo}>
        <Text style={deviceHistoryStyles.deviceName}>
          {device.name || 'Unknown Device'}
        </Text>
        <Text style={deviceHistoryStyles.deviceLastConnected}>
          Last connected: {formattedTime}
        </Text>
        <Text style={deviceHistoryStyles.deviceId} numberOfLines={1}>
          ID: {device.id.substring(0, 8)}...
        </Text>
        {/* Debug info - remove later */}
        <Text
          style={[deviceHistoryStyles.deviceId, { color: 'red', fontSize: 10 }]}
        >
          DEBUG: name="{device.name}" hasName={!!device.name}
        </Text>
      </View>

      <View style={deviceHistoryStyles.deviceActions}>
        {editMode ? (
          <NativeIcon name="delete" size={20} color={colors.error} />
        ) : (
          <NativeIcon
            name="chevron-right"
            size={20}
            color={colors.textSecondary}
          />
        )}
      </View>
    </TouchableOpacity>
  );
};
