import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useRoute, RouteProp } from '@react-navigation/native';
import { figmaTheme as t } from '../theme/figmaTheme';
import { ChatMessage, Message } from '../components/figma/ChatMessage';
import { ModelBadge } from '../components/figma/ModelBadge';
import { AIInfoModal } from '../components/figma/AIInfoModal';
import { llamaTextGenerationService } from '../services/LlamaTextGenerationService';
import { createSportsPromptWithContext } from '../services/prompts/sportsPrompts';
import { trainingContextService } from '../services/TrainingContextService';
import { useTheme } from '../theme/ThemeContext';

const MODEL_DISPLAY_NAME = 'Llama 3.2 3B - Sports Science';

const QUICK_PROMPTS = [
  'What should I do today?',
  'Am I making progress?',
  'I feel tired — should I rest?',
  'Help me plan this week',
  'What does my ACWR mean?',
  'How can I improve my endurance?',
];

const SUMMARY_RANGES = [
  {
    label: 'This week',
    prompt:
      'Summarise my training for this week. What patterns do you notice? What is going well and what should I focus on?',
  },
  {
    label: 'Last 2 weeks',
    prompt:
      'Summarise my training for the last 2 weeks. What trends do you see in my load and consistency? What would you recommend?',
  },
  {
    label: 'This month',
    prompt:
      'Give me a monthly training summary. How has my fitness load changed? Am I progressing, maintaining, or at risk?',
  },
  {
    label: 'Last 3 months',
    prompt:
      'Summarise my training over the last 3 months. What are the biggest patterns you see? Where should I focus my energy going forward?',
  },
];

const INITIAL_MESSAGE: Message = {
  id: 0,
  role: 'assistant',
  content:
    "Hi! I'm your local AI fitness assistant. How can I help you with your fitness journey today?",
};

export function FigmaAIChatScreen() {
  const { c } = useTheme();
  const route =
    useRoute<RouteProp<{ FigmaAIChat: { prefill?: string } }, 'FigmaAIChat'>>();
  const prefill = (route.params as any)?.prefill as string | undefined;
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [inputValue, setInputValue] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isModelReady, setIsModelReady] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const nextId = useRef(1);
  const prefillSent = useRef(false);
  // Token batching — accumulate tokens in a ref; flush to state at 60 ms
  // instead of on every single token (~300 → ~12 Markdown re-renders per reply).
  const accumulatedRef = useRef('');
  const assistantIdRef = useRef<number | null>(null);
  const flushTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-send prefill once model is ready (handles both "model already ready"
  // and "model still initialising when navigation happens" cases)
  useEffect(() => {
    if (prefill && isModelReady && !prefillSent.current) {
      prefillSent.current = true;
      handleSend(prefill);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefill, isModelReady]);

  // Reset sent-guard if a new prefill arrives (e.g. user taps banner again)
  useEffect(() => {
    prefillSent.current = false;
    if (prefill) setInputValue(prefill);
  }, [prefill]);

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

  // Cancel any in-flight flush timer on unmount.
  useEffect(() => {
    return () => {
      if (flushTimerRef.current) clearInterval(flushTimerRef.current);
    };
  }, []);

  const scrollToBottom = () => {
    setTimeout(
      () => scrollViewRef.current?.scrollToEnd({ animated: true }),
      100,
    );
  };

  // The model generates only the JSON answer value; strip closing `"}` and unescape.
  const parseJsonResponse = (raw: string): string => {
    const stripped = raw.replace(/"\s*\}\s*$/, '').trim();
    try {
      return JSON.parse(`"${stripped}"`);
    } catch {
      return stripped
        .replace(/\\n/g, '\n')
        .replace(/\\t/g, '\t')
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, '\\');
    }
  };

  const handleSend = useCallback(
    async (overrideText?: string) => {
      const text = (overrideText ?? inputValue).trim();
      if (!text || isGenerating) return;

      const userMsg: Message = {
        id: ++nextId.current,
        role: 'user',
        content: text,
      };

      const assistantId = ++nextId.current;
      const assistantPlaceholder: Message = {
        id: assistantId,
        role: 'assistant',
        content: '',
        isStreaming: true,
      };

      setMessages(prev => [...prev, userMsg, assistantPlaceholder]);
      if (!overrideText) setInputValue('');
      setIsGenerating(true);
      scrollToBottom();

      try {
        const { contextBlock } =
          await trainingContextService.buildContextForQuery(text);
        const prompt = createSportsPromptWithContext(text, contextBlock);
        accumulatedRef.current = '';
        assistantIdRef.current = assistantId;

        // Batch token updates to ~16 fps — avoids a full Markdown re-render on
        // every single token (~300 renders reduced to ~12 per reply).
        flushTimerRef.current = setInterval(() => {
          const display = parseJsonResponse(accumulatedRef.current);
          setMessages(prev =>
            prev.map(m =>
              m.id === assistantIdRef.current
                ? { ...m, content: display, isStreaming: true }
                : m,
            ),
          );
          scrollViewRef.current?.scrollToEnd({ animated: false });
        }, 60);

        const result = await llamaTextGenerationService.generateTextStreaming(
          prompt,
          {
            maxTokens: 1024,
            temperature: 0.4,
            stopTokens: ['"}', '<|im_end|>', '</s>'],
          },
          (token: string) => {
            accumulatedRef.current += token; // ref-only; no re-render per token
          },
          text,
        );

        clearInterval(flushTimerRef.current);
        flushTimerRef.current = null;

        setMessages(prev =>
          prev.map(m =>
            m.id === assistantId
              ? {
                  ...m,
                  content: result.success
                    ? parseJsonResponse(result.generatedText)
                    : "I'm having trouble responding right now. Please try again.",
                  isStreaming: false,
                }
              : m,
          ),
        );
      } catch {
        if (flushTimerRef.current) {
          clearInterval(flushTimerRef.current);
          flushTimerRef.current = null;
        }
        setMessages(prev =>
          prev.map(m =>
            m.id === assistantId
              ? {
                  ...m,
                  content: 'Sorry, I encountered an error. Please try again.',
                  isStreaming: false,
                }
              : m,
          ),
        );
      } finally {
        setIsGenerating(false);
        scrollToBottom();
      }
    },
    [inputValue, isGenerating],
  );

  const handleQuickSend = useCallback(
    (text: string) => handleSend(text),
    [handleSend],
  );

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
              <Text style={[styles.statusText, { color: c.muted }]}>
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
          </ScrollView>

          {/* Input */}
          <View style={[styles.inputArea, { borderTopColor: c.border }]}>
            {/* Summary period chips */}
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: c.muted }]}>
                Summary:
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.chipScroll}
              >
                {SUMMARY_RANGES.map(r => (
                  <TouchableOpacity
                    key={r.label}
                    style={[
                      styles.summaryChip,
                      { backgroundColor: c.surface, borderColor: c.border },
                      (!isModelReady || isGenerating) && styles.chipDisabled,
                    ]}
                    onPress={() => handleQuickSend(r.prompt)}
                    disabled={!isModelReady || isGenerating}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.summaryChipText, { color: c.muted }]}>
                      {r.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Quick question chips */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.chipScroll}
            >
              {QUICK_PROMPTS.map(p => (
                <TouchableOpacity
                  key={p}
                  style={[
                    styles.quickChip,
                    { backgroundColor: c.surface, borderColor: c.border },
                    (!isModelReady || isGenerating) && styles.chipDisabled,
                  ]}
                  onPress={() => handleQuickSend(p)}
                  disabled={!isModelReady || isGenerating}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.quickChipText, { color: c.foreground }]}>
                    {p}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
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
                placeholderTextColor={c.muted}
                multiline
                editable={isModelReady && !isGenerating}
                returnKeyType="send"
                onSubmitEditing={() => handleSend()}
                blurOnSubmit={false}
              />
              <TouchableOpacity
                style={[
                  styles.sendBtn,
                  (!inputValue.trim() || isGenerating || !isModelReady) &&
                    styles.sendBtnDisabled,
                ]}
                onPress={() => handleSend()}
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
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  chipScroll: {
    flexGrow: 0,
    marginBottom: 8,
  },
  summaryChip: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginRight: 8,
  },
  summaryChipText: {
    fontSize: 12,
    fontWeight: '500',
  },
  quickChip: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginRight: 8,
  },
  quickChipText: {
    fontSize: 13,
  },
  chipDisabled: {
    opacity: 0.4,
  },
});
