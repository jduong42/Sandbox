import React from 'react';
import { View, Text } from 'react-native';
import { smlScreenStyles as styles } from '../../theme/smlScreen';

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  confidence?: number;
  category?: string;
}

interface SMLMessageProps {
  message: ChatMessage;
}

export const SMLMessage: React.FC<SMLMessageProps> = ({ message }) => {
  return (
    <View
      style={[
        styles.messageContainer,
        message.type === 'user'
          ? styles.userMessageContainer
          : styles.aiMessageContainer,
      ]}
    >
      <View
        style={[
          styles.messageBubble,
          message.type === 'user' ? styles.userBubble : styles.aiBubble,
        ]}
      >
        <Text
          style={[
            styles.messageText,
            message.type === 'user'
              ? styles.userMessageText
              : styles.aiMessageText,
          ]}
        >
          {message.content}
        </Text>

        {message.type === 'ai' && (message.confidence || message.category) && (
          <View style={styles.messageMetadata}>
            {message.confidence && (
              <Text style={styles.confidenceText}>
                Confidence: {Math.round(message.confidence * 100)}%
              </Text>
            )}
            {message.category && (
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>
                  {message.category.replace('_', ' ')}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>

      <Text style={styles.messageTimestamp}>
        {message.timestamp.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </Text>
    </View>
  );
};

export default SMLMessage;
