import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import NativeIcon from '../common/NativeIcon';
import { theme } from '../../theme';
import { smlScreenStyles as styles } from '../../theme/smlScreen';

interface SMLHeaderProps {
  isInitialized: boolean;
  currentHeartRate?: number;
  onHeartRateAdvice: () => void;
}

export const SMLHeader: React.FC<SMLHeaderProps> = ({
  isInitialized,
  currentHeartRate,
  onHeartRateAdvice,
}) => {
  return (
    <View style={styles.header}>
      <NativeIcon name="psychology" size={32} color={theme.colors.primary} />
      <View style={styles.headerTextContainer}>
        <Text style={styles.headerTitle}>AI Sports Coach</Text>
        <Text style={styles.headerSubtitle}>
          {isInitialized ? 'Ready to help' : 'Initializing...'}
        </Text>
      </View>
      {currentHeartRate && (
        <TouchableOpacity style={styles.hrButton} onPress={onHeartRateAdvice}>
          <NativeIcon name="favorite" size={16} color={theme.colors.error} />
          <Text style={styles.hrButtonText}>{currentHeartRate}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default SMLHeader;
