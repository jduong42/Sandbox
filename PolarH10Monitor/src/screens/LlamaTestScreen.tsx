import React, { useState, useRef, useEffect } from 'react';
import {
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { AnimatedTabView } from '../components';
import {
  ChatHeader,
  ChatInput,
  ChatMessage,
  TypingIndicator,
} from '../components/chat';
import { llamaTextGenerationService } from '../services/LlamaTextGenerationService';
import { createSportsPrompt } from '../prompts/sportsPrompts';
import { theme } from '../theme';
import { llamaTestScreenStyles as styles } from '../theme/llamaTestScreen';

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
        temperature: 0.4, // Original value 0.7
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
          <ChatHeader isModelReady={isModelReady} onClearMessages={clearChat} />

          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.messagesContent}
          >
            {messages.map((message, index) => (
              <ChatMessage
                key={`${message.timestamp}-${index}`}
                message={message}
              />
            ))}

            {isGenerating && <TypingIndicator />}
          </ScrollView>

          <ChatInput
            inputText={inputText}
            setInputText={setInputText}
            onSend={sendMessage}
            isGenerating={isGenerating}
          />
        </LinearGradient>
      </KeyboardAvoidingView>
    </AnimatedTabView>
  );
};

export default ChatAIScreen;
