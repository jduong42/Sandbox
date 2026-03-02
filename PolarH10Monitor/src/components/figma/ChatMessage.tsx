import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { figmaTheme as t } from '../../theme/figmaTheme';
import { useTheme } from '../../theme/ThemeContext';

export interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
}

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const { c } = useTheme();

  return (
    <View style={[styles.row, isUser ? styles.rowUser : styles.rowAssistant]}>
      {/* Avatar */}
      <View
        style={[
          styles.avatar,
          isUser ? styles.avatarUser : styles.avatarAssistant,
        ]}
      >
        <Text style={styles.avatarText}>{isUser ? '👤' : '🤖'}</Text>
      </View>

      {/* Bubble */}
      <View
        style={[
          styles.bubbleWrap,
          isUser ? styles.bubbleWrapUser : styles.bubbleWrapAssistant,
        ]}
      >
        {isUser ? (
          <View style={styles.userBubble}>
            <Text style={styles.userText}>
              {message.content}
              {message.isStreaming && <Text style={styles.cursor}> ▌</Text>}
            </Text>
          </View>
        ) : (
          <View
            style={[
              styles.assistantBubble,
              { backgroundColor: c.surface, borderColor: c.border },
            ]}
          >
            <Text style={[styles.assistantText, { color: c.foreground }]}>
              {message.content}
              {message.isStreaming && <Text style={styles.cursor}> ▌</Text>}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: t.spacing.lg,
    alignItems: 'flex-start',
  },
  rowUser: { flexDirection: 'row-reverse' },
  rowAssistant: { flexDirection: 'row' },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarUser: { backgroundColor: '#a855f7' },
  avatarAssistant: { backgroundColor: '#3b82f6' },
  avatarText: { fontSize: 16 },
  bubbleWrap: { flex: 1, maxWidth: '80%' },
  bubbleWrapUser: { alignItems: 'flex-end' },
  bubbleWrapAssistant: { alignItems: 'flex-start' },
  userBubble: {
    backgroundColor: '#a855f7',
    borderRadius: 16,
    borderBottomRightRadius: 4,
    paddingHorizontal: t.spacing.lg,
    paddingVertical: t.spacing.md,
  },
  assistantBubble: {
    backgroundColor: t.colors.surface,
    borderWidth: 1,
    borderColor: t.colors.border,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    paddingHorizontal: t.spacing.lg,
    paddingVertical: t.spacing.md,
  },
  userText: {
    color: '#fff',
    fontSize: t.typography.sizes.sm,
    lineHeight: 20,
  },
  assistantText: {
    color: t.colors.foreground,
    fontSize: t.typography.sizes.sm,
    lineHeight: 20,
  },
  cursor: {
    color: t.colors.primary,
    opacity: 0.8,
  },
});
