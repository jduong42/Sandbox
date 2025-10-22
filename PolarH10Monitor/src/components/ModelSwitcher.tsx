import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { llamaTextGenerationService } from '../services/LlamaTextGenerationService';

const ModelSwitcher: React.FC = () => {
  const [currentModel, setCurrentModel] = useState<string>(
    'DeepSeek-R1-Distill-Qwen-1.5B-Q4_K_M.gguf',
  );
  const [isLoading, setIsLoading] = useState(false);

  const availableModels = [
    {
      name: 'DeepSeek-R1-Distill (Original)',
      filename: 'DeepSeek-R1-Distill-Qwen-1.5B-Q4_K_M.gguf',
      size: '1.12GB',
      description: 'Original model with reasoning capabilities',
    },
    {
      name: 'DeepSeek-R1-Sports (Fine-tuned)',
      filename: 'DeepSeek-R1-Sports-Q4_K_M.gguf',
      size: '1.12GB',
      description: 'Fine-tuned for sports science specialization',
    },
  ];

  const switchModel = async (modelFilename: string) => {
    if (isLoading) return;

    setIsLoading(true);

    try {
      // Release current model
      await llamaTextGenerationService.release();

      // Initialize with new model
      const modelPath = `${
        require('react-native-fs').MainBundlePath
      }/${modelFilename}`;
      const success = await llamaTextGenerationService.initialize(modelPath);

      if (success) {
        setCurrentModel(modelFilename);
        Alert.alert('Success', `Switched to ${modelFilename}`);
      } else {
        Alert.alert('Error', 'Failed to switch model');
      }
    } catch (error) {
      Alert.alert('Error', `Model switch failed: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔄 Model Switcher</Text>
      <Text style={styles.subtitle}>Current: {currentModel}</Text>

      {availableModels.map((model, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.modelButton,
            currentModel === model.filename && styles.activeModel,
            isLoading && styles.disabledButton,
          ]}
          onPress={() => switchModel(model.filename)}
          disabled={isLoading || currentModel === model.filename}
        >
          <Text style={styles.modelName}>{model.name}</Text>
          <Text style={styles.modelSize}>{model.size}</Text>
          <Text style={styles.modelDescription}>{model.description}</Text>
        </TouchableOpacity>
      ))}

      {isLoading && (
        <Text style={styles.loadingText}>🔄 Switching model...</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    margin: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 15,
  },
  modelButton: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeModel: {
    backgroundColor: '#e6f3ff',
    borderColor: '#007AFF',
  },
  disabledButton: {
    opacity: 0.6,
  },
  modelName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  modelSize: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  modelDescription: {
    fontSize: 12,
    color: '#333',
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#007AFF',
    marginTop: 10,
  },
});

export default ModelSwitcher;
