import React from 'react';
import { ScrollView } from 'react-native';
import { DeviceItem } from './DeviceItem';
import { deviceHistoryStyles } from '../../../theme/deviceHistoryStyles';
import { StoredDevice } from '../../../services/DeviceHistoryService';

interface DeviceListProps {
  devices: StoredDevice[];
  editMode: boolean;
  onDevicePress: (device: StoredDevice) => void;
}

export const DeviceList: React.FC<DeviceListProps> = ({
  devices,
  editMode,
  onDevicePress,
}) => {
  return (
    <ScrollView
      style={deviceHistoryStyles.devicesList}
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled={true}
    >
      {devices.map(device => (
        <DeviceItem
          key={device.id}
          device={device}
          editMode={editMode}
          onPress={onDevicePress}
        />
      ))}
    </ScrollView>
  );
};
