import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Surface } from 'react-native-paper';
import { AnimatedTabView } from '../components';
import NativeIcon from '../components/common/NativeIcon';
import { llamaTextGenerationService } from '../services/LlamaTextGenerationService';
import { createSportsPrompt } from '../prompts/sportsPrompts';
import { theme } from '../theme';

const { width, height } = Dimensions.get('window');

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const ChatAIScreen: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm your specialized sports science AI assistant. I can provide evidence-based advice on training optimization, heart rate zones, HRV analysis, recovery strategies, and performance enhancement. Ask me about your fitness data or training questions!",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isModelReady, setIsModelReady] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    checkModelStatus();
  }, []);

  const checkModelStatus = async () => {
    try {
      // Initialize the model
      const success = await llamaTextGenerationService.initialize();
      setIsModelReady(success);
    } catch (error) {
      console.error('Model initialization error:', error);
      setIsModelReady(false);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim() || isGenerating) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsGenerating(true);

    // Scroll to bottom after user message
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      const config = {
        maxTokens: 450, // Increased for complete responses with safety disclaimers
        temperature: 0.7,
        stopTokens: ['<|im_end|>', '</s>'], // More appropriate stop tokens
      };

      // Create proper sports science prompt with system context
      const sportsPrompt = createSportsPrompt(userMessage.text);
      const response = await llamaTextGenerationService.generateText(
        sportsPrompt,
        config,
      );

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.success
          ? response.generatedText
          : "I apologize, but I'm having trouble generating a response right now. Please try again.",
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);

      // Scroll to bottom after AI response
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Generation error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I encountered an error while processing your request. Please try again.',
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsGenerating(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const clearChat = () => {
    setMessages([
      {
        id: '1',
        text: "Hello! I'm your specialized sports science AI assistant. I can provide evidence-based advice on training optimization, heart rate zones, HRV analysis, recovery strategies, and performance enhancement. Ask me about your fitness data or training questions!",
        isUser: false,
        timestamp: new Date(),
      },
    ]);
  };

  const renderMessage = (message: Message) => (
    <View
      key={message.id}
      style={[
        styles.messageContainer,
        message.isUser
          ? styles.userMessageContainer
          : styles.aiMessageContainer,
      ]}
    >
      <Surface
        style={[
          styles.messageBubble,
          message.isUser ? styles.userBubble : styles.aiBubble,
        ]}
        elevation={2}
      >
        <Text
          style={[
            styles.messageText,
            message.isUser ? styles.userMessageText : styles.aiMessageText,
          ]}
        >
          {message.text}
        </Text>
        <Text
          style={[
            styles.timestamp,
            message.isUser ? styles.userTimestamp : styles.aiTimestamp,
          ]}
        >
          {formatTime(message.timestamp)}
        </Text>
      </Surface>
    </View>
  );

  return (
    <AnimatedTabView>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <StatusBar
          barStyle="light-content"
          backgroundColor={theme.colors.background}
        />

        <LinearGradient
          colors={[theme.colors.background, theme.colors.backgroundSecondary]}
          style={styles.gradient}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <View style={styles.headerLeft}>
                <NativeIcon
                  name="brain"
                  size={28}
                  color={theme.colors.primary}
                />
                <View>
                  <Text style={styles.headerTitle}>AI Assistant</Text>
                  <Text style={styles.headerSubtitle}>
                    {isModelReady ? '🟢 Ready' : '🟡 Initializing...'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity style={styles.clearButton} onPress={clearChat}>
                <NativeIcon
                  name="refresh"
                  size={20}
                  color={theme.colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Messages */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.messagesContent}
          >
            {messages.map(renderMessage)}

            {isGenerating && (
              <View
                style={[styles.messageContainer, styles.aiMessageContainer]}
              >
                <Surface
                  style={[styles.messageBubble, styles.aiBubble]}
                  elevation={2}
                >
                  <View style={styles.typingIndicator}>
                    <View style={styles.typingDot} />
                    <View style={styles.typingDot} />
                    <View style={styles.typingDot} />
                  </View>
                </Surface>
              </View>
            )}
          </ScrollView>

          {/* Input */}
          <View style={styles.inputContainer}>
            <Surface style={styles.inputSurface} elevation={3}>
              <TextInput
                style={styles.textInput}
                value={inputText}
                onChangeText={setInputText}
                placeholder="Ask about fitness, HRV, training zones..."
                placeholderTextColor={theme.colors.textSecondary}
                multiline
                maxLength={500}
                editable={!isGenerating && isModelReady}
              />
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  (!inputText.trim() || isGenerating || !isModelReady) &&
                    styles.sendButtonDisabled,
                ]}
                onPress={sendMessage}
                disabled={!inputText.trim() || isGenerating || !isModelReady}
              >
                <NativeIcon
                  name={isGenerating ? 'hourglass' : 'send'}
                  size={20}
                  color={
                    !inputText.trim() || isGenerating || !isModelReady
                      ? theme.colors.textSecondary
                      : 'white'
                  }
                />
              </TouchableOpacity>
            </Surface>
          </View>
        </LinearGradient>
      </KeyboardAvoidingView>
    </AnimatedTabView>
  );
};

const styles = {
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerContent: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
  },
  headerLeft: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: theme.spacing.md,
  },
  headerTitle: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
  },
  headerSubtitle: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
  },
  clearButton: {
    padding: theme.spacing.sm,
    borderRadius: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  messageContainer: {
    marginBottom: theme.spacing.md,
  },
  userMessageContainer: {
    alignItems: 'flex-end' as const,
  },
  aiMessageContainer: {
    alignItems: 'flex-start' as const,
  },
  messageBubble: {
    maxWidth: width * 0.8,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.spacing.lg,
  },
  userBubble: {
    backgroundColor: theme.colors.primary,
    borderBottomRightRadius: theme.spacing.sm,
  },
  aiBubble: {
    backgroundColor: theme.colors.surface,
    borderBottomLeftRadius: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  messageText: {
    fontSize: theme.typography.sizes.md,
    lineHeight: 20,
    marginBottom: theme.spacing.xs,
  },
  userMessageText: {
    color: 'white',
  },
  aiMessageText: {
    color: theme.colors.text,
  },
  timestamp: {
    fontSize: theme.typography.sizes.xs,
    opacity: 0.7,
  },
  userTimestamp: {
    color: 'white',
    textAlign: 'right' as const,
  },
  aiTimestamp: {
    color: theme.colors.textSecondary,
  },
  typingIndicator: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 4,
    paddingVertical: theme.spacing.xs,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.textSecondary,
    opacity: 0.6,
  },
  inputContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    paddingBottom: Platform.OS === 'ios' ? theme.spacing.xl : theme.spacing.md,
  },
  inputSurface: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.spacing.xl,
    flexDirection: 'row' as const,
    alignItems: 'flex-end' as const,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  textInput: {
    flex: 1,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text,
    maxHeight: 100,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
  },
  sendButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.spacing.lg,
    padding: theme.spacing.sm,
    marginLeft: theme.spacing.sm,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    minWidth: 40,
    minHeight: 40,
  },
  sendButtonDisabled: {
    backgroundColor: theme.colors.backgroundSecondary,
  },
};

export default ChatAIScreen;
