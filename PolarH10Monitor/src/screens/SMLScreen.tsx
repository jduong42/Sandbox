import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StatusBar,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
} from 'react-native';
import NativeIcon from '../components/common/NativeIcon';
import { theme } from '../theme';
import { useSportsAI, useHeartRateMonitoring } from '../hooks';
import { SportsAIResponse } from '../services';

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  confidence?: number;
  category?: string;
}

const SMLScreen: React.FC = () => {
  const [question, setQuestion] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const scrollViewRef = useRef<FlatList>(null);

  const {
    isInitialized,
    isLoading,
    askQuestion,
    getHeartRateAdvice,
    getCommonQuestions,
    error,
    clearError,
  } = useSportsAI();

  const { currentHeartRate } = useHeartRateMonitoring();

  const addMessage = (
    type: 'user' | 'ai',
    content: string,
    aiResponse?: SportsAIResponse,
  ) => {
    const message: ChatMessage = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date(),
    };

    if (aiResponse) {
      message.confidence = aiResponse.confidence;
      message.category = aiResponse.category;
    }

    setChatHistory(prev => [...prev, message]);

    // Scroll to bottom after adding message
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleAskQuestion = async () => {
    if (!question.trim()) return;

    const userQuestion = question.trim();
    setQuestion('');

    // Add user message
    addMessage('user', userQuestion);

    try {
      const response = await askQuestion(userQuestion);
      if (response) {
        addMessage('ai', response.answer, response);
      } else {
        addMessage(
          'ai',
          'Sorry, I encountered an error while processing your question. Please try again.',
        );
      }
    } catch (err) {
      addMessage(
        'ai',
        'Sorry, I encountered an error while processing your question. Please try again.',
      );
    }
  };

  const handleCommonQuestion = async (commonQuestion: string) => {
    addMessage('user', commonQuestion);

    try {
      const response = await askQuestion(commonQuestion);
      if (response) {
        addMessage('ai', response.answer, response);
      } else {
        addMessage(
          'ai',
          'Sorry, I encountered an error while processing your question. Please try again.',
        );
      }
    } catch (err) {
      addMessage(
        'ai',
        'Sorry, I encountered an error while processing your question. Please try again.',
      );
    }
  };

  const handleHeartRateAdvice = async () => {
    if (!currentHeartRate) {
      Alert.alert(
        'No Heart Rate Data',
        'Please connect to your Polar H10 device to get personalized heart rate advice.',
        [{ text: 'OK' }],
      );
      return;
    }

    addMessage(
      'user',
      `Get advice for my current heart rate: ${currentHeartRate} bpm`,
    );

    try {
      const response = await getHeartRateAdvice(currentHeartRate);
      if (response) {
        addMessage('ai', response.answer, response);
      } else {
        addMessage(
          'ai',
          'Sorry, I encountered an error while analyzing your heart rate. Please try again.',
        );
      }
    } catch (err) {
      addMessage(
        'ai',
        'Sorry, I encountered an error while analyzing your heart rate. Please try again.',
      );
    }
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => (
    <View
      style={[
        styles.messageContainer,
        item.type === 'user' ? styles.userMessage : styles.aiMessage,
      ]}
    >
      <View
        style={[
          styles.messageBubble,
          item.type === 'user' ? styles.userBubble : styles.aiBubble,
        ]}
      >
        <Text
          style={[
            styles.messageText,
            item.type === 'user' ? styles.userText : styles.aiText,
          ]}
        >
          {item.content}
        </Text>

        {item.type === 'ai' && item.confidence && (
          <View style={styles.aiMetadata}>
            <Text style={styles.confidenceText}>
              Confidence: {Math.round(item.confidence * 100)}%
            </Text>
            {item.category && (
              <Text style={styles.categoryText}>
                Category: {item.category.replace('_', ' ')}
              </Text>
            )}
          </View>
        )}
      </View>

      <Text style={styles.timestamp}>
        {item.timestamp.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </Text>
    </View>
  );

  if (!isInitialized && isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={theme.colors.background}
        />
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Initializing AI Assistant...</Text>
      </View>
    );
  }

  if (error && !isInitialized) {
    return (
      <View style={styles.errorContainer}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={theme.colors.background}
        />
        <NativeIcon name="error" size={64} color={theme.colors.error} />
        <Text style={styles.errorTitle}>AI Service Error</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={clearError}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const commonQuestions = getCommonQuestions();

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={theme.colors.background}
      />

      {/* Header */}
      <View style={styles.header}>
        <NativeIcon name="psychology" size={32} color={theme.colors.primary} />
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>AI Sports Coach</Text>
          <Text style={styles.headerSubtitle}>
            {isInitialized ? 'Ready to help' : 'Initializing...'}
          </Text>
        </View>
        {currentHeartRate && (
          <TouchableOpacity
            style={styles.hrButton}
            onPress={handleHeartRateAdvice}
          >
            <NativeIcon name="favorite" size={16} color={theme.colors.error} />
            <Text style={styles.hrButtonText}>{currentHeartRate}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Chat History */}
      {chatHistory.length > 0 ? (
        <FlatList
          ref={scrollViewRef}
          data={chatHistory}
          keyExtractor={item => item.id}
          renderItem={renderMessage}
          style={styles.chatContainer}
          contentContainerStyle={styles.chatContent}
        />
      ) : (
        <ScrollView
          style={styles.chatContainer}
          contentContainerStyle={styles.welcomeContainer}
        >
          <Text style={styles.welcomeTitle}>
            Welcome to your AI Sports Coach!
          </Text>
          <Text style={styles.welcomeText}>
            Ask me anything about sports science, training, nutrition, recovery,
            or heart rate analysis.
          </Text>

          {/* Common Questions */}
          <Text style={styles.sectionTitle}>Popular Questions:</Text>
          {commonQuestions.slice(0, 5).map((q, index) => (
            <TouchableOpacity
              key={index}
              style={styles.commonQuestionButton}
              onPress={() => handleCommonQuestion(q)}
            >
              <Text style={styles.commonQuestionText}>{q}</Text>
              <NativeIcon
                name="chevron-right"
                size={16}
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <View
          style={[
            styles.inputWrapper,
            isInputFocused && styles.inputWrapperFocused,
          ]}
        >
          <TextInput
            style={styles.textInput}
            value={question}
            onChangeText={setQuestion}
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => setIsInputFocused(false)}
            placeholder="Ask about training, nutrition, recovery..."
            placeholderTextColor={theme.colors.textSecondary}
            multiline
            maxLength={500}
            editable={isInitialized && !isLoading}
          />

          <TouchableOpacity
            style={[
              styles.sendButton,
              (!question.trim() || !isInitialized || isLoading) &&
                styles.sendButtonDisabled,
            ]}
            onPress={handleAskQuestion}
            disabled={!question.trim() || !isInitialized || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={theme.colors.surface} />
            ) : (
              <NativeIcon name="send" size={20} color={theme.colors.surface} />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: theme.colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  loadingText: {
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: theme.colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  errorTitle: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.error,
    marginTop: theme.spacing.md,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.lg,
  },
  retryButtonText: {
    color: theme.colors.surface,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.medium,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.backgroundSecondary,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTextContainer: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  headerTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
  },
  headerSubtitle: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
  },
  hrButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.error,
  },
  hrButtonText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.error,
    fontWeight: theme.typography.weights.medium,
    marginLeft: theme.spacing.xs,
  },
  chatContainer: {
    flex: 1,
  },
  chatContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  welcomeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  welcomeTitle: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  welcomeText: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    lineHeight: 24,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    alignSelf: 'flex-start',
    width: '100%',
  },
  commonQuestionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.backgroundSecondary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    width: '100%',
  },
  commonQuestionText: {
    flex: 1,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text,
    marginRight: theme.spacing.sm,
  },
  messageContainer: {
    marginBottom: theme.spacing.md,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  aiMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
  },
  userBubble: {
    backgroundColor: theme.colors.primary,
  },
  aiBubble: {
    backgroundColor: theme.colors.backgroundSecondary,
  },
  messageText: {
    fontSize: theme.typography.sizes.md,
    lineHeight: 20,
  },
  userText: {
    color: theme.colors.surface,
  },
  aiText: {
    color: theme.colors.text,
  },
  aiMetadata: {
    marginTop: theme.spacing.xs,
    paddingTop: theme.spacing.xs,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  confidenceText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
  },
  categoryText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    textTransform: 'capitalize',
  },
  timestamp: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  inputContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.backgroundSecondary,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  inputWrapperFocused: {
    borderColor: theme.colors.primary,
  },
  textInput: {
    flex: 1,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text,
    maxHeight: 100,
    marginRight: theme.spacing.sm,
  },
  sendButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.full,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: theme.colors.textSecondary,
  },
});

export default SMLScreen;
