import React, { useState, useRef } from 'react';
import {
  View,
  StatusBar,
  FlatList,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  Alert,
} from 'react-native';
import NativeIcon from '../components/common/NativeIcon';
import { theme } from '../theme';
import { useSportsAI, useHeartRateMonitoring } from '../hooks';
import { SportsAIResponse } from '../services';
import {
  SMLHeader,
  SMLMessage,
  SMLInput,
  SMLWelcome,
} from '../components/sml';
import { smlScreenStyles as styles } from '../theme/smlScreen';

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
      confidence: aiResponse?.confidence,
      category: aiResponse?.category,
    };

    setChatHistory(prev => [...prev, message]);

    // Auto-scroll to bottom
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleSubmitQuestion = async () => {
    if (!question.trim() || isLoading || !isInitialized) return;

    const userQuestion = question.trim();
    setQuestion('');
    
    // Add user message
    addMessage('user', userQuestion);

    try {
      const response = await askQuestion(userQuestion);
      addMessage('ai', response.response, response);
    } catch (error) {
      console.error('Error asking question:', error);
      addMessage('ai', 'Sorry, I could not process your question at the moment.');
    }
  };

  const handleHeartRateAdvice = async () => {
    if (!currentHeartRate || isLoading || !isInitialized) return;

    try {
      const response = await getHeartRateAdvice(currentHeartRate);
      addMessage('ai', response.response, response);
    } catch (error) {
      console.error('Error getting heart rate advice:', error);
      addMessage('ai', 'Sorry, I could not analyze your heart rate at the moment.');
    }
  };

  const handleQuestionSelect = (selectedQuestion: string) => {
    setQuestion(selectedQuestion);
  };

  // Loading state
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

  // Error state
  if (error && !isInitialized) {
    return (
      <View style={styles.errorContainer}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={theme.colors.background}
        />
        <NativeIcon name="error" size={64} color={theme.colors.error} />
        <Text style={styles.errorText}>{error}</Text>
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

      <SMLHeader
        isInitialized={isInitialized}
        currentHeartRate={currentHeartRate ?? undefined}
        onHeartRateAdvice={handleHeartRateAdvice}
      />

      {chatHistory.length > 0 ? (
        <FlatList
          ref={scrollViewRef}
          data={chatHistory}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <SMLMessage message={item} />}
          style={styles.chatContainer}
          contentContainerStyle={styles.chatContent}
        />
      ) : (
        <SMLWelcome
          commonQuestions={commonQuestions}
          onQuestionSelect={handleQuestionSelect}
        />
      )}

      <SMLInput
        question={question}
        setQuestion={setQuestion}
        onSend={handleSubmitQuestion}
        isLoading={isLoading}
        isInitialized={isInitialized}
        isInputFocused={isInputFocused}
        setIsInputFocused={setIsInputFocused}
      />
    </View>
  );
};

export default SMLScreen;
