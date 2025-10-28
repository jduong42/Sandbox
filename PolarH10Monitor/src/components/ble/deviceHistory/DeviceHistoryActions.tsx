import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import NativeIcon from '../../common/NativeIcon';
import { deviceHistoryStyles } from '../../../theme/deviceHistoryStyles';
import { colors } from '../../../theme/colors';

interface DeviceHistoryActionsProps {
  editMode: boolean;
  onToggleEditMode: () => void;
  onClearAll: () => void;
}

export const DeviceHistoryActions: React.FC<DeviceHistoryActionsProps> = ({
  editMode,
  onToggleEditMode,
  onClearAll,
}) => {
  return (
    <View style={deviceHistoryStyles.actionsBar}>
      <TouchableOpacity
        style={[
          deviceHistoryStyles.actionButton,
          editMode && deviceHistoryStyles.actionButtonActive,
        ]}
        onPress={onToggleEditMode}
      >
        <NativeIcon
          name={editMode ? 'check' : 'edit'}
          size={16}
          color={editMode ? colors.surface : colors.primary}
        />
        <Text
          style={[
            deviceHistoryStyles.actionButtonText,
            editMode && deviceHistoryStyles.actionButtonTextActive,
          ]}
        >
          {editMode ? 'Done' : 'Edit'}
        </Text>
      </TouchableOpacity>

      {editMode && (
        <TouchableOpacity
          style={deviceHistoryStyles.clearAllButton}
          onPress={onClearAll}
        >
          <NativeIcon name="delete" size={16} color={colors.error} />
          <Text style={deviceHistoryStyles.clearAllButtonText}>Clear All</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};
