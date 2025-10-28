import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import NativeIcon from '../../common/NativeIcon';
import { colors } from '../../../theme/colors';
import { deviceHistoryStyles } from '../../../theme/deviceHistoryStyles';

interface DeviceHistoryHeaderProps {
  isExpanded: boolean;
  deviceCount: number;
  onToggleExpanded: () => void;
}

export const DeviceHistoryHeader: React.FC<DeviceHistoryHeaderProps> = ({
  isExpanded,
  deviceCount,
  onToggleExpanded,
}) => {
  return (
    <TouchableOpacity
      style={deviceHistoryStyles.header}
      onPress={onToggleExpanded}
      activeOpacity={0.7}
    >
      <View style={deviceHistoryStyles.headerLeft}>
        <NativeIcon
          name="history"
          size={24}
          color={colors.primary}
          style={deviceHistoryStyles.headerIcon}
        />
        <Text style={deviceHistoryStyles.headerTitle}>Remembered Devices</Text>
        {deviceCount > 0 && (
          <View style={deviceHistoryStyles.badge}>
            <Text style={deviceHistoryStyles.badgeText}>{deviceCount}</Text>
          </View>
        )}
      </View>

      <NativeIcon
        name={isExpanded ? 'expand-less' : 'expand-more'}
        size={20}
        color={colors.textSecondary}
      />
    </TouchableOpacity>
  );
};
