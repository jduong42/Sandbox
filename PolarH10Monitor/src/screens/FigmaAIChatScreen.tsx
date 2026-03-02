import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { figmaTheme as t } from '../theme/figmaTheme';
import { ChatMessage, Message } from '../components/figma/ChatMessage';
import { ModelBadge } from '../components/figma/ModelBadge';
import { AIInfoModal } from '../components/figma/AIInfoModal';
import { llamaTextGenerationService } from '../services/LlamaTextGenerationService';
import { createSportsPrompt } from '../prompts/sportsPrompts';
import { useTheme } from '../theme/ThemeContext';

const MODEL_DISPLAY_NAME = 'model_q4km';

const INITIAL_MESSAGE: Message = {
  id: 0,
  role: 'assistant',
  content:
    "Hi! I'm your local AI fitness assistant. How can I help you with your fitness journey today?",
};

export function FigmaAIChatScreen() {
  const { c } = useTheme();
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [inputValue, setInputValue] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isModelReady, setIsModelReady] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const nextId = useRef(1);

  useEffect(() => {
    llamaTextGenerationService
      .initialize()
      .then(success => {
        setIsModelReady(success);
        if (!success) setInitError('Model failed to load');
      })
      .catch(err => {
        setInitError(String(err));
        setIsModelReady(false);
      });
  }, []);

  const scrollToBottom = () => {
    setTimeout(
      () => scrollViewRef.current?.scrollToEnd({ animated: true }),
      100,
    );
  };

  const handleSend = async () => {
    const text = inputValue.trim();
    if (!text || isGenerating) return;

    const userMsg: Message = {
      id: ++nextId.current,
      role: 'user',
      content: text,
    };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsGenerating(true);
    scrollToBottom();

    try {
      const prompt = createSportsPrompt(text);
      const result = await llamaTextGenerationService.generateText(prompt, {
        maxTokens: 450,
        temperature: 0.4,
        stopTokens: ['<|im_end|>', '</s>'],
      });

      const aiMsg: Message = {
        id: ++nextId.current,
        role: 'assistant',
        content: result.success
          ? result.generatedText
          : "I'm having trouble responding right now. Please try again.",
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: ++nextId.current,
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
        },
      ]);
    } finally {
      setIsGenerating(false);
      scrollToBottom();
    }
  };

  return (
    <LinearGradient colors={c.background} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.kav}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <LinearGradient
                colors={['#3b82f6', '#a855f7']}
                style={styles.botAvatar}
              >
                <Text style={styles.botEmoji}>🤖</Text>
              </LinearGradient>
              <Text style={[styles.title, { color: c.foreground }]}>
                AI Assistant
              </Text>
            </View>
            <View style={styles.statusDot}>
              <View
                style={[
                  styles.statusDotCircle,
                  {
                    backgroundColor: isModelReady
                      ? t.colors.green
                      : t.colors.muted,
                  },
                ]}
              />
              <Text style={styles.statusText}>
                {isModelReady ? 'Ready' : initError ? 'Error' : 'Loading...'}
              </Text>
            </View>
          </View>

          {/* Model Badge */}
          <View style={styles.badgeContainer}>
            <ModelBadge
              modelName={MODEL_DISPLAY_NAME}
              onInfoClick={() => setShowInfoModal(true)}
            />
          </View>

          {/* Messages */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.messages}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
          >
            {messages.map(msg => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            {isGenerating && (
              <View style={styles.typingRow}>
                <View style={styles.typingBubble}>
                  <ActivityIndicator size="small" color={t.colors.muted} />
                  <Text style={styles.typingText}>AI is thinking...</Text>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Input */}
          <View style={[styles.inputArea, { borderTopColor: c.border }]}>
            <View style={styles.inputRow}>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: c.surface,
                    borderColor: c.border,
                    color: c.foreground,
                  },
                ]}
                value={inputValue}
                onChangeText={setInputValue}
                placeholder="Ask me anything about your fitness..."
                placeholderTextColor={t.colors.muted}
                multiline
                editable={isModelReady && !isGenerating}
                returnKeyType="send"
                onSubmitEditing={handleSend}
                blurOnSubmit={false}
              />
              <TouchableOpacity
                style={[
                  styles.sendBtn,
                  (!inputValue.trim() || isGenerating || !isModelReady) &&
                    styles.sendBtnDisabled,
                ]}
                onPress={handleSend}
                disabled={!inputValue.trim() || isGenerating || !isModelReady}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={
                    inputValue.trim() && isModelReady && !isGenerating
                      ? [t.colors.primary, t.colors.primaryTo]
                      : [t.colors.accent, t.colors.accent]
                  }
                  style={styles.sendBtnGradient}
                >
                  <Text style={styles.sendIcon}>➤</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
            {!isModelReady && !initError && (
              <Text style={styles.loadingHint}>Initializing AI model...</Text>
            )}
            {initError && (
              <Text style={styles.errorHint}>
                ⚠️ Model could not be loaded. Ensure model_q4km.gguf is in the
                app bundle.
              </Text>
            )}
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>

      <AIInfoModal
        visible={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        modelName={MODEL_DISPLAY_NAME}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  kav: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: t.spacing.xl,
    paddingTop: t.spacing.xl,
    paddingBottom: t.spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  botAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botEmoji: { fontSize: 18 },
  title: {
    fontSize: t.typography.sizes.xxl,
    fontWeight: t.typography.weights.semibold,
    color: t.colors.foreground,
  },
  statusDot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDotCircle: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: t.typography.sizes.sm,
    color: t.colors.muted,
  },
  badgeContainer: {
    paddingHorizontal: t.spacing.xl,
    paddingBottom: t.spacing.md,
  },
  messages: { flex: 1 },
  messagesContent: {
    paddingHorizontal: t.spacing.xl,
    paddingVertical: t.spacing.lg,
  },
  typingRow: {
    flexDirection: 'row',
    marginBottom: t.spacing.lg,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: t.colors.surface,
    borderWidth: 1,
    borderColor: t.colors.border,
    borderRadius: 16,
    paddingHorizontal: t.spacing.lg,
    paddingVertical: t.spacing.md,
  },
  typingText: {
    fontSize: t.typography.sizes.sm,
    color: t.colors.muted,
  },
  inputArea: {
    paddingHorizontal: t.spacing.xl,
    paddingVertical: t.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: t.colors.border,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
  },
  textInput: {
    flex: 1,
    backgroundColor: t.colors.surface,
    borderWidth: 1,
    borderColor: t.colors.border,
    borderRadius: t.radius.lg,
    paddingHorizontal: t.spacing.lg,
    paddingVertical: t.spacing.md,
    color: t.colors.foreground,
    fontSize: t.typography.sizes.base,
    maxHeight: 120,
    minHeight: 52,
  },
  sendBtn: { borderRadius: 12, overflow: 'hidden' },
  sendBtnDisabled: { opacity: 0.4 },
  sendBtnGradient: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendIcon: {
    color: '#fff',
    fontSize: 16,
    fontWeight: t.typography.weights.bold,
  },
  loadingHint: {
    fontSize: t.typography.sizes.xs,
    color: t.colors.muted,
    textAlign: 'center',
    marginTop: t.spacing.sm,
  },
  errorHint: {
    fontSize: t.typography.sizes.xs,
    color: t.colors.amber,
    textAlign: 'center',
    marginTop: t.spacing.sm,
    lineHeight: 16,
  },
});
