import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  TextInput,
} from 'react-native';
import { llamaTextGenerationService } from '../services/LlamaTextGenerationService';

const LlamaTestScreen: React.FC = () => {
  const [isInitializing, setIsInitializing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [testResult, setTestResult] = useState<string>('');
  const [customPrompt, setCustomPrompt] = useState<string>('What is HRV and why is it important for athletes?');

  const initializeLlama = async () => {
    setIsInitializing(true);
    setTestResult('🚀 Initializing Llama service...');

    try {
      const success = await llamaTextGenerationService.initialize();
      
      if (success) {
        setIsInitialized(true);
        setTestResult('✅ Llama service initialized successfully!\n\nReady to generate text.');
      } else {
        setTestResult('❌ Failed to initialize Llama service.\n\nCheck if model file is in bundle.');
      }
    } catch (error) {
      setTestResult(`❌ Initialization error: ${error}`);
    } finally {
      setIsInitializing(false);
    }
  };

  const testSportsAdvice = async () => {
    if (!isInitialized) {
      Alert.alert('Error', 'Please initialize Llama service first');
      return;
    }

    setIsGenerating(true);
    setTestResult('🧠 Generating sports science advice...');

    try {
      const result = await llamaTextGenerationService.generateSportsAdvice(
        'What is HRV and why is it important for athletes?',
        300 // Increased max tokens for better answers  
      );

      if (result.success) {
        setTestResult(`✅ Generation successful!\n\n` +
          `Time: ${result.processingTime}ms\n` +
          `Tokens: ${result.tokenCount}\n\n` +
          `Response:\n${result.generatedText}`);
      } else {
        setTestResult(`❌ Generation failed: ${result.error}`);
      }
    } catch (error) {
      setTestResult(`❌ Test error: ${error}`);
    } finally {
      setIsGenerating(false);
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
        500 // Higher token limit for detailed custom responses
      );

      if (result.success) {
        setTestResult(`✅ Custom prompt successful!\n\n` +
          `Prompt: "${customPrompt.trim()}"\n\n` +
          `Time: ${result.processingTime}ms\n` +
          `Tokens: ${result.tokenCount}\n\n` +
          `Response:\n${result.generatedText}`);
      } else {
        setTestResult(`❌ Custom prompt failed: ${result.error}`);
      }
    } catch (error) {
      setTestResult(`❌ Custom prompt error: ${error}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const runQuickTest = async () => {
    if (!isInitialized) {
      Alert.alert('Error', 'Please initialize Llama service first');
      return;
    }

    setIsGenerating(true);
    setTestResult('🧪 Running quick Llama test...');

    try {
      const result = await llamaTextGenerationService.generateText(
        'Hello, how are you?',
        {
          maxTokens: 100, // Increased for better responses
          temperature: 0.7,
          stopTokens: ['.', '!', '?'],
        }
      );

      if (result.success) {
        setTestResult(`✅ Quick test successful!\n\n` +
          `Response: ${result.generatedText}\n` +
          `Time: ${result.processingTime}ms`);
      } else {
        setTestResult(`❌ Quick test failed: ${result.error}`);
      }
    } catch (error) {
      setTestResult(`❌ Quick test error: ${error}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const checkStatus = () => {
    const status = llamaTextGenerationService.getStatus();
    setTestResult(`📊 Llama Service Status:\n\n` +
      `Initialized: ${status.initialized ? '✅' : '❌'}\n` +
      `Model Path: ${status.modelPath || 'None'}`);
  };

  return (
    <View style={styles.container}>
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
              onPress={() => setCustomPrompt('Explain the relationship between heart rate variability and recovery in athletes. Include practical applications.')}
            >
              <Text style={styles.presetButtonText}>HRV & Recovery</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.presetButton}
              onPress={() => setCustomPrompt('What are the key differences between aerobic and anaerobic training? How should athletes balance them?')}
            >
              <Text style={styles.presetButtonText}>Training Types</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.presetButton}
              onPress={() => setCustomPrompt('Describe optimal nutrition strategies for endurance athletes before, during, and after training sessions.')}
            >
              <Text style={styles.presetButtonText}>Sports Nutrition</Text>
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
            {isInitializing ? '🔄 Initializing...' : '🚀 Initialize Llama'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, (!isInitialized || isGenerating) && styles.buttonDisabled]}
          onPress={runQuickTest}
          disabled={!isInitialized || isGenerating}
        >
          <Text style={styles.buttonText}>
            {isGenerating ? '🧠 Generating...' : '🧪 Quick Test'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, (!isInitialized || isGenerating) && styles.buttonDisabled]}
          onPress={testSportsAdvice}
          disabled={!isInitialized || isGenerating}
        >
          <Text style={styles.buttonText}>
            {isGenerating ? '🧠 Generating...' : '🏃‍♂️ Test Sports Advice'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.customButton, (!isInitialized || isGenerating) && styles.buttonDisabled]}
          onPress={testCustomPrompt}
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

      <ScrollView style={styles.resultContainer}>
        <Text style={styles.resultText}>{testResult}</Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  promptContainer: {
    marginBottom: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
  },
  promptLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  promptInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 80,
    maxHeight: 120,
    backgroundColor: '#f9f9f9',
  },
  buttonContainer: {
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  statusButton: {
    backgroundColor: '#34C759',
  },
  customButton: {
    backgroundColor: '#FF9500',
  },
  presetContainer: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  presetLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#666',
  },
  presetButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  presetButton: {
    backgroundColor: '#6C7CE7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginBottom: 4,
  },
  presetButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
  },
  resultText: {
    fontSize: 14,
    fontFamily: 'Courier New',
    color: '#333',
    lineHeight: 20,
  },
});

export default LlamaTestScreen;