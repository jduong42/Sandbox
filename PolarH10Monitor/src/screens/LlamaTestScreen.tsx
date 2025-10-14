import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { llamaTextGenerationService } from '../services/LlamaTextGenerationService';
import { llamaTestScreenStyles as styles } from '../theme';

const LlamaTestScreen: React.FC = () => {
  const [isInitializing, setIsInitializing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [testResult, setTestResult] = useState<string>('');
  const [customPrompt, setCustomPrompt] = useState<string>(
    'What is HRV and why is it important for athletes?',
  );

  const initializeLlama = async () => {
    setIsInitializing(true);
    setTestResult('🚀 Initializing Llama service...');

    try {
      const success = await llamaTextGenerationService.initialize();

      if (success) {
        setIsInitialized(true);
        setTestResult(
          '✅ Llama service initialized successfully!\n\nReady to generate text.',
        );
      } else {
        setTestResult(
          '❌ Failed to initialize Llama service.\n\nCheck if model file is in bundle.',
        );
      }
    } catch (error) {
      setTestResult(`❌ Initialization error: ${error}`);
    } finally {
      setIsInitializing(false);
    }
  };

  const testCustomPrompt = async () => {
    if (!isInitialized) {
      Alert.alert('Error', 'Please initialize Llama service first');
      return;
    }

    if (!customPrompt.trim()) {
      Alert.alert('Error', 'Please enter a custom prompt');
      return;
    }

    setIsGenerating(true);
    setTestResult('🧠 Generating custom response...');

    try {
      const result = await llamaTextGenerationService.generateSportsAdvice(
        customPrompt.trim(),
        500, // Higher token limit for detailed custom responses
      );

      if (result.success) {
        setTestResult(
          `✅ Custom prompt successful!\n\n` +
            `Prompt: "${customPrompt.trim()}"\n\n` +
            `Time: ${result.processingTime}ms\n` +
            `Tokens: ${result.tokenCount}\n\n` +
            `Response:\n${result.generatedText}`,
        );
      } else {
        setTestResult(`❌ Custom prompt failed: ${result.error}`);
      }
    } catch (error) {
      setTestResult(`❌ Custom prompt error: ${error}`);
    } finally {
      setIsGenerating(false);
    }
  };



  const checkStatus = () => {
    const status = llamaTextGenerationService.getStatus();
    
    setTestResult(
      `📊 Llama Service Status:\n\n` +
        `Initialized: ${status.initialized ? '✅' : '❌'}\n` +
        `Model: ${status.modelType}\n` +
        `Prompt Version: ${status.promptVersion}\n` +
        `Model Path: ${status.modelPath || 'None'}`
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.innerContainer}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View>
            <Text style={styles.title}>🦙 Llama.rn Test Screen</Text>

            {/* Custom Prompt Input */}
            <View style={styles.promptContainer}>
              <Text style={styles.promptLabel}>✍️ Custom Prompt:</Text>
              <TextInput
                style={styles.promptInput}
                value={customPrompt}
                onChangeText={setCustomPrompt}
                placeholder="Enter your question or prompt here..."
                multiline={true}
                numberOfLines={3}
                textAlignVertical="top"
              />

              {/* Preset Prompt Buttons */}
              <View style={styles.presetContainer}>
                <Text style={styles.presetLabel}>Quick Presets:</Text>
                <View style={styles.presetButtons}>
                  <TouchableOpacity
                    style={styles.presetButton}
                    onPress={() =>
                      setCustomPrompt(
                        'Explain the relationship between heart rate variability and recovery in athletes. Include practical applications.',
                      )
                    }
                  >
                    <Text style={styles.presetButtonText}>HRV & Recovery</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.presetButton}
                    onPress={() =>
                      setCustomPrompt(
                        'What are the key differences between aerobic and anaerobic training? How should athletes balance them?',
                      )
                    }
                  >
                    <Text style={styles.presetButtonText}>Training Types</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.presetButton}
                    onPress={() =>
                      setCustomPrompt(
                        'Describe optimal nutrition strategies for endurance athletes before, during, and after training sessions.',
                      )
                    }
                  >
                    <Text style={styles.presetButtonText}>
                      Sports Nutrition
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, isInitializing && styles.buttonDisabled]}
                onPress={initializeLlama}
                disabled={isInitializing}
              >
                <Text style={styles.buttonText}>
                  {isInitializing
                    ? '🔄 Initializing...'
                    : '🚀 Initialize Llama'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.button,
                  styles.customButton,
                  (!isInitialized || isGenerating) && styles.buttonDisabled,
                ]}
                onPress={() => {
                  Keyboard.dismiss();
                  testCustomPrompt();
                }}
                disabled={!isInitialized || isGenerating}
              >
                <Text style={styles.buttonText}>
                  {isGenerating ? '🧠 Generating...' : '✍️ Ask Custom Question'}
                </Text>
              </TouchableOpacity>



              <TouchableOpacity
                style={[styles.button, styles.statusButton]}
                onPress={checkStatus}
              >
                <Text style={styles.buttonText}>📊 Check Status</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>

        <ScrollView
          style={styles.resultContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={true}
        >
          <Text style={styles.resultText}>{testResult}</Text>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

export default LlamaTestScreen;
