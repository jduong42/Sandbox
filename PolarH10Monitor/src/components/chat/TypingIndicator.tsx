import React from 'react';
import { View } from 'react-native';
import { llamaTestScreenStyles as styles } from '../../theme/llamaTestScreen';

export const TypingIndicator: React.FC = () => {
  return (
    <View style={styles.messageContainer}>
      <View style={styles.aiMessageContainer}>
        <View style={[styles.messageBubble, styles.aiBubble]}>
          <View style={styles.typingIndicator}>
            <View style={styles.typingDot} />
            <View style={styles.typingDot} />
            <View style={styles.typingDot} />
          </View>
        </View>
      </View>
    </View>
  );
};

export default TypingIndicator;
