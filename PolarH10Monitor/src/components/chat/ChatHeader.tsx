import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import NativeIcon from '../common/NativeIcon';
import { theme } from '../../theme';
import { llamaTestScreenStyles as styles } from '../../theme/llamaTestScreen';

interface ChatHeaderProps {
  isModelReady: boolean;
  onClearMessages: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  isModelReady,
  onClearMessages,
}) => {
  return (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <View style={styles.headerLeft}>
          <NativeIcon name="brain" size={28} color={theme.colors.primary} />
          <View>
            <Text style={styles.headerTitle}>AI Assistant</Text>
            <Text style={styles.headerSubtitle}>
              {isModelReady ? '🟢 Ready' : '🟡 Initializing...'}
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.clearButton} onPress={onClearMessages}>
          <NativeIcon
            name="delete"
            size={20}
            color={theme.colors.textSecondary}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ChatHeader;
