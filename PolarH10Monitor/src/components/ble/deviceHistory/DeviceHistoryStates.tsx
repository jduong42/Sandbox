import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import NativeIcon from '../../common/NativeIcon';
import { deviceHistoryStyles } from '../../../theme/deviceHistoryStyles';
import { colors } from '../../../theme/colors';

interface DeviceHistoryStatesProps {
  loading?: boolean;
  error?: string | null;
  isEmpty?: boolean;
  onRefresh?: () => void;
}

export const DeviceHistoryStates: React.FC<DeviceHistoryStatesProps> = ({
  loading,
  error,
  isEmpty,
  onRefresh,
}) => {
  if (loading) {
    return (
      <View style={deviceHistoryStyles.loadingContainer}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={deviceHistoryStyles.loadingText}>Loading devices...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={deviceHistoryStyles.errorContainer}>
        <Text style={deviceHistoryStyles.errorText}>{error}</Text>
        {onRefresh && (
          <TouchableOpacity
            style={deviceHistoryStyles.retryButton}
            onPress={onRefresh}
          >
            <Text style={deviceHistoryStyles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  if (isEmpty) {
    return (
      <View style={deviceHistoryStyles.emptyContainer}>
        <NativeIcon
          name="bluetooth"
          size={48}
          color={colors.textSecondary}
          style={deviceHistoryStyles.emptyIcon}
        />
        <Text style={deviceHistoryStyles.emptyText}>No remembered devices</Text>
        <Text style={deviceHistoryStyles.emptySubtext}>
          Connect to a device to see it here for quick reconnection
        </Text>
      </View>
    );
  }

  return null;
};
