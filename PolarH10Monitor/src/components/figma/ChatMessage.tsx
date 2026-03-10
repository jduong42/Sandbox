import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Markdown from 'react-native-markdown-display';
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

/**
 * The model often emits single \n between paragraphs/bullet items.
 * Markdown needs a blank line (\n\n) to break paragraphs or start a list.
 * This function upgrades every single newline that isn't already part of a
 * double-newline into a double-newline so the renderer creates proper nodes.
 */
function normalizeMarkdown(text: string): string {
  return text
    .replace(/\r\n/g, '\n') // normalise CRLF
    .replace(/\n{3,}/g, '\n\n') // collapse 3+ blank lines → 1 blank line
    .replace(/([^\n])\n([^\n])/g, '$1\n\n$2'); // single \n → \n\n
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
            {message.isStreaming && message.content === '' ? (
              <Text style={[styles.assistantText, { color: c.muted }]}>
                Thinking<Text style={styles.cursor}>…</Text>
              </Text>
            ) : message.isStreaming ? (
              // Plain Text during streaming — Markdown parsing is too expensive
              // on partial/incomplete content. Switch to Markdown when done.
              <Text style={[styles.assistantText, { color: c.foreground }]}>
                {message.content}
                <Text style={styles.cursor}> ▌</Text>
              </Text>
            ) : (
              <Markdown
                style={{
                  body: {
                    color: c.foreground,
                    fontSize: t.typography.sizes.sm,
                    lineHeight: 22,
                    margin: 0,
                    padding: 0,
                  },
                  strong: { color: c.foreground, fontWeight: '700' },
                  em: { color: c.foreground, fontStyle: 'italic' },
                  bullet_list: { marginTop: 6, marginBottom: 6 },
                  ordered_list: { marginTop: 6, marginBottom: 6 },
                  list_item: { marginBottom: 4 },
                  paragraph: { marginTop: 0, marginBottom: 10 },
                  code_inline: {
                    backgroundColor: c.accent,
                    color: c.foreground,
                    borderRadius: 4,
                    paddingHorizontal: 4,
                    fontSize: t.typography.sizes.xs,
                    fontFamily: 'Courier',
                  },
                  fence: {
                    backgroundColor: c.accent,
                    borderRadius: 8,
                    padding: 8,
                    marginVertical: 4,
                  },
                  code_block: {
                    backgroundColor: c.accent,
                    borderRadius: 8,
                    padding: 8,
                    color: c.foreground,
                    fontSize: t.typography.sizes.xs,
                    fontFamily: 'Courier',
                  },
                }}
              >
                {normalizeMarkdown(message.content) +
                  (message.isStreaming ? ' ▌' : '')}
              </Markdown>
            )}
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
