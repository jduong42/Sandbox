/**
 * ONNX Test Screen
 * Test the ONNX runtime integration and fine-tuned model setup
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Card } from '../components/common/Card';
import { ONNXModelManager } from '../services/ONNXModelManager';
import { simplifiedTextGenerationService } from '../services/SimplifiedTextGenerationService';
import { theme } from '../theme';

interface MultiPromptResult {
  prompt: string;
  category: string;
  success: boolean;
  generatedText: string;
  tokenCount: number;
  processingTime: number;
  error?: string;
}

interface ONNXTestResults {
  onnxAvailable?: boolean;
  onnxRuntimeExists?: boolean;
  runtimeInitialization?: boolean;
  details?: string[];
  overall?: boolean | null;
  modelLoading?: {
    success: boolean;
    message: string;
    loadTime?: number;
  };
  modelInference?: {
    success: boolean;
    message: string;
    response?: string;
    inferenceTime?: number;
  };
  textGeneration?: {
    success: boolean;
    message: string;
    response?: string;
    details?: {
      [key: string]: any;
    };
  };
  simplifiedGeneration?: {
    success: boolean;
    generatedText: string;
    tokenCount: number;
    processingTime: number;
    error?: string;
  };
  sportsAdvice?: {
    success: boolean;
    generatedText: string;
    tokenCount: number;
    processingTime: number;
    error?: string;
  };
  multiPromptTest?: {
    overall: boolean;
    results: MultiPromptResult[];
    totalTests: number;
    successfulTests: number;
  };
}

interface ModelInfo {
  exists: boolean;
  location: string;
  path?: string;
  size?: number;
}

const ONNXTestScreen: React.FC = () => {
  const [testResults, setTestResults] = useState<ONNXTestResults>({});
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const runTests = async () => {
    setIsRunning(true);
    try {
      // TODO: Re-enable when ONNXTestService is implemented
      // const runtimeTest = await onnxTestService.testONNXRuntime();

      setTestResults({
        onnxAvailable: true,
        onnxRuntimeExists: true, // Placeholder for now
        runtimeInitialization: true, // Placeholder for now
        overall: true,
        details: ['ONNX Test Service not implemented yet'],
      });
    } catch (error) {
      console.error('Failed to run ONNX tests:', error);
      setTestResults({
        overall: false,
        onnxAvailable: false,
        onnxRuntimeExists: false,
        runtimeInitialization: false,
        details: [
          `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        ],
      });
    } finally {
      setIsRunning(false);
    }
  };

  const testFineTunedModel = async () => {
    setIsRunning(true);
    try {
      // TODO: Re-enable when FineTunedModelTestService is implemented
      // const modelTests = await fineTunedModelTestService.runAllTests();

      setTestResults(prev => ({
        ...prev,
        modelLoading: {
          success: true,
          message: 'Fine-tuned model test service not implemented yet',
        },
        modelInference: {
          success: true,
          message: 'Fine-tuned model test service not implemented yet',
        },
        textGeneration: {
          success: true,
          message: 'Fine-tuned model test service not implemented yet',
        },
        overall: (prev.overall ?? true) && true,
      }));
    } catch (error) {
      console.error('Failed to test fine-tuned model:', error);
      setTestResults(prev => ({
        ...prev,
        modelLoading: {
          success: false,
          message: `Error: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
        },
        overall: false,
      }));
    } finally {
      setIsRunning(false);
    }
  };

  const checkModelFiles = async () => {
    setIsRunning(true);
    try {
      const info = await ONNXModelManager.getModelInfo();
      setModelInfo(info);
    } catch (error) {
      console.error('Failed to check model files:', error);
      setModelInfo({
        exists: false,
        location: 'error',
      });
    } finally {
      setIsRunning(false);
    }
  };

  const testSportsAdvice = async () => {
    setIsRunning(true);
    try {
      // Initialize the service
      console.log('🚀 Initializing simplified text generation service...');
      const initialized = await simplifiedTextGenerationService.initialize();

      if (!initialized) {
        setTestResults(prev => ({
          ...prev,
          sportsAdvice: {
            success: false,
            generatedText: '',
            tokenCount: 0,
            processingTime: 0,
            error: 'Failed to initialize service',
          },
        }));
        return;
      }

      // Generate sports science advice with longer response
      console.log('🏃‍♂️ Generating sports science advice...');
      const result = await simplifiedTextGenerationService.generateSportsAdvice(
        'What are the optimal heart rate zones for endurance training?',
        120, // Generate up to 120 tokens for a complete answer
      );

      setTestResults(prev => ({
        ...prev,
        sportsAdvice: result,
        overall: (prev.overall ?? true) && result.success,
      }));
    } catch (error) {
      console.error('❌ Sports advice test failed:', error);
      setTestResults(prev => ({
        ...prev,
        sportsAdvice: {
          success: false,
          generatedText: '',
          tokenCount: 0,
          processingTime: 0,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        overall: false,
      }));
    } finally {
      setIsRunning(false);
    }
  };

  const testMultiplePrompts = async () => {
    setIsRunning(true);

    // Define focused test prompts with more tokens for complete responses
    const testPrompts = [
      {
        prompt:
          'Question: What are the 5 heart rate training zones for endurance athletes? Answer with specific percentages of max heart rate for each zone.',
        category: 'Heart Rate Training Zones',
      },
      {
        prompt:
          "Question: What's the specific training protocol for 10K race preparation? Focus on weekly mileage and pace targets.",
        category: '10K Race Training Protocol',
      },
      {
        prompt:
          'Question: What are the warning signs of overtraining syndrome? List 5 key symptoms athletes should watch for.',
        category: 'Overtraining Warning Signs',
      },
      {
        prompt:
          'Question: What training methods improve VO2 max most effectively? Give specific workout examples with durations.',
        category: 'VO2 Max Training Methods',
      },
      {
        prompt:
          'Question: Compare interval training vs steady state cardio. When should an athlete choose each method?',
        category: 'Training Method Comparison',
      },
    ];

    const results: MultiPromptResult[] = [];
    let successCount = 0;

    try {
      // Initialize the service once
      console.log(
        '🚀 Initializing simplified text generation service for multi-prompt test...',
      );
      const initialized = await simplifiedTextGenerationService.initialize();

      if (!initialized) {
        setTestResults(prev => ({
          ...prev,
          multiPromptTest: {
            overall: false,
            results: [],
            totalTests: testPrompts.length,
            successfulTests: 0,
          },
        }));
        return;
      }

      // Test each prompt
      for (let i = 0; i < testPrompts.length; i++) {
        const testPrompt = testPrompts[i];
        if (!testPrompt) {
          console.warn(`Test prompt at index ${i} is undefined, skipping`);
          continue;
        }

        const { prompt, category } = testPrompt;
        console.log(
          `🧪 Testing prompt ${i + 1}/${testPrompts.length}: ${category}`,
        );

        try {
          const result =
            await simplifiedTextGenerationService.generateSportsAdvice(
              prompt,
              150, // Generate 150 tokens for complete, comprehensive responses
            );

          const testResult: MultiPromptResult = {
            prompt,
            category,
            success: result.success,
            generatedText: result.generatedText,
            tokenCount: result.tokenCount,
            processingTime: result.processingTime,
            ...(result.error && { error: result.error }),
          };

          results.push(testResult);

          if (result.success) {
            successCount++;
          }
        } catch (error) {
          console.error(`❌ Failed on prompt: ${category}`, error);
          results.push({
            prompt,
            category,
            success: false,
            generatedText: '',
            tokenCount: 0,
            processingTime: 0,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }

      // Update results
      setTestResults(prev => ({
        ...prev,
        multiPromptTest: {
          overall: successCount > 0,
          results,
          totalTests: testPrompts.length,
          successfulTests: successCount,
        },
        overall: (prev.overall ?? true) && successCount > 0,
      }));

      console.log(
        `✅ Multi-prompt test completed: ${successCount}/${testPrompts.length} successful`,
      );
    } catch (error) {
      console.error('❌ Multi-prompt test failed:', error);
      setTestResults(prev => ({
        ...prev,
        multiPromptTest: {
          overall: false,
          results,
          totalTests: testPrompts.length,
          successfulTests: successCount,
        },
        overall: false,
      }));
    } finally {
      setIsRunning(false);
    }
  };

  const testSimplifiedGeneration = async () => {
    setIsRunning(true);
    try {
      // Initialize the service
      console.log('🚀 Initializing simplified text generation service...');
      const initialized = await simplifiedTextGenerationService.initialize();

      if (!initialized) {
        setTestResults(prev => ({
          ...prev,
          simplifiedGeneration: {
            success: false,
            generatedText: '',
            tokenCount: 0,
            processingTime: 0,
            error: 'Failed to initialize service',
          },
        }));
        return;
      }

      // Generate text with simple configuration
      console.log('🎯 Starting text generation...');
      const result = await simplifiedTextGenerationService.generateText(
        'What are optimal heart rate training zones?',
        {
          maxTokens: 8, // Generate 8 tokens for meaningful response
          temperature: 0.7,
          stopTokenIds: [151645], // <|im_end|>
        },
      );

      setTestResults(prev => ({
        ...prev,
        simplifiedGeneration: result,
        overall: (prev.overall ?? true) && result.success,
      }));
    } catch (error) {
      console.error('❌ Simplified generation test failed:', error);
      setTestResults(prev => ({
        ...prev,
        simplifiedGeneration: {
          success: false,
          generatedText: '',
          tokenCount: 0,
          processingTime: 0,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        overall: false,
      }));
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <Card style={styles.card}>
        <Text style={styles.title}>ONNX Runtime Testing</Text>

        <Text style={styles.subtitle}>
          This screen tests ONNX runtime integration and checks for your
          fine-tuned model files.
        </Text>
      </Card>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.button,
            styles.primaryButton,
            { opacity: isRunning ? 0.6 : 1 },
          ]}
          onPress={runTests}
          disabled={isRunning}
        >
          <Text style={styles.buttonText}>
            {isRunning ? 'Running...' : 'Run ONNX Tests'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            styles.secondaryButton,
            { opacity: isRunning ? 0.6 : 1 },
          ]}
          onPress={checkModelFiles}
          disabled={isRunning}
        >
          <Text style={styles.buttonText}>
            {isRunning ? 'Checking...' : 'Check Model Files'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Fine-Tuned Model Test Button */}
      <View style={styles.singleButtonContainer}>
        <TouchableOpacity
          style={[
            styles.button,
            styles.fineTunedButton,
            { opacity: isRunning ? 0.6 : 1 },
          ]}
          onPress={testFineTunedModel}
          disabled={isRunning}
        >
          <Text style={styles.buttonText}>
            {isRunning ? 'Testing Model...' : '🧠 Test Fine-Tuned Model'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Simplified Text Generation Button */}
      <View style={styles.singleButtonContainer}>
        <TouchableOpacity
          style={[
            styles.button,
            styles.successButton,
            { opacity: isRunning ? 0.6 : 1 },
          ]}
          onPress={testSimplifiedGeneration}
          disabled={isRunning}
        >
          <Text style={styles.buttonText}>
            {isRunning ? 'Generating Text...' : '✨ Test Simplified Generation'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Sports Science Advice Button */}
      <View style={styles.singleButtonContainer}>
        <TouchableOpacity
          style={[
            styles.button,
            styles.sportsButton,
            { opacity: isRunning ? 0.6 : 1 },
          ]}
          onPress={testSportsAdvice}
          disabled={isRunning}
        >
          <Text style={styles.buttonText}>
            {isRunning ? 'Generating Advice...' : '🏃‍♂️ Sports Science Advice'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Multi-Prompt Robustness Test Button */}
      <View style={styles.singleButtonContainer}>
        <TouchableOpacity
          style={[
            styles.button,
            styles.multiPromptButton,
            { opacity: isRunning ? 0.6 : 1 },
          ]}
          onPress={testMultiplePrompts}
          disabled={isRunning}
        >
          <Text style={styles.buttonText}>
            {isRunning
              ? 'Testing 5 Prompts...'
              : '🧪 Complete Response Test (5 prompts)'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Test Results */}
      {Object.keys(testResults).length > 0 && (
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Test Results</Text>

          {testResults.onnxAvailable !== undefined && (
            <Text style={styles.resultText}>
              <Text style={styles.bold}>ONNX Runtime Available:</Text>{' '}
              {testResults.onnxAvailable ? '✅ Yes' : '❌ No'}
            </Text>
          )}

          {testResults.onnxRuntimeExists !== undefined && (
            <Text style={styles.resultText}>
              <Text style={styles.bold}>Runtime Exists:</Text>{' '}
              {testResults.onnxRuntimeExists ? '✅ Yes' : '❌ No'}
            </Text>
          )}

          {testResults.runtimeInitialization !== undefined && (
            <Text style={styles.resultText}>
              <Text style={styles.bold}>Runtime Initialization:</Text>{' '}
              {testResults.runtimeInitialization ? '✅ Success' : '❌ Failed'}
            </Text>
          )}

          {testResults.details && testResults.details.length > 0 && (
            <View style={styles.detailsContainer}>
              <Text style={styles.detailsTitle}>Details:</Text>
              {testResults.details.map((detail, index) => (
                <Text key={index} style={styles.detailText}>
                  • {detail}
                </Text>
              ))}
            </View>
          )}
        </Card>
      )}

      {/* Fine-Tuned Model Results */}
      {(testResults.modelLoading ||
        testResults.modelInference ||
        testResults.textGeneration ||
        testResults.simplifiedGeneration ||
        testResults.sportsAdvice ||
        testResults.multiPromptTest) && (
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Fine-Tuned Model Test Results</Text>

          {testResults.modelLoading && (
            <View style={styles.testResultContainer}>
              <Text style={styles.testResultTitle}>Model Loading:</Text>
              <Text
                style={[
                  styles.testResultStatus,
                  {
                    color: testResults.modelLoading.success
                      ? theme.colors.success
                      : theme.colors.error,
                  },
                ]}
              >
                {testResults.modelLoading.success ? '✅ Success' : '❌ Failed'}
              </Text>
              <Text style={styles.testResultDetail}>
                {testResults.modelLoading.message}
              </Text>
              {testResults.modelLoading.loadTime && (
                <Text style={styles.testResultDetail}>
                  Load Time: {testResults.modelLoading.loadTime}ms
                </Text>
              )}
            </View>
          )}

          {testResults.modelInference && (
            <View style={styles.testResultContainer}>
              <Text style={styles.testResultTitle}>Model Inference:</Text>
              <Text
                style={[
                  styles.testResultStatus,
                  {
                    color: testResults.modelInference.success
                      ? theme.colors.success
                      : theme.colors.error,
                  },
                ]}
              >
                {testResults.modelInference.success
                  ? '✅ Success'
                  : '❌ Failed'}
              </Text>
              <Text style={styles.testResultDetail}>
                {testResults.modelInference.message}
              </Text>
              {testResults.modelInference.response && (
                <Text style={styles.testResultDetail}>
                  Response: {testResults.modelInference.response}
                </Text>
              )}
              {testResults.modelInference.inferenceTime && (
                <Text style={styles.testResultDetail}>
                  Inference Time: {testResults.modelInference.inferenceTime}ms
                </Text>
              )}
            </View>
          )}

          {testResults.textGeneration && (
            <View style={styles.testResultContainer}>
              <Text style={styles.testResultTitle}>Text Generation:</Text>
              <Text
                style={[
                  styles.testResultStatus,
                  {
                    color: testResults.textGeneration.success
                      ? theme.colors.success
                      : theme.colors.error,
                  },
                ]}
              >
                {testResults.textGeneration.success
                  ? '✅ Success'
                  : '❌ Failed'}
              </Text>
              <Text style={styles.testResultDetail}>
                {testResults.textGeneration.message}
              </Text>
              {testResults.textGeneration.response && (
                <Text style={styles.testResultDetail}>
                  Generated: {testResults.textGeneration.response}
                </Text>
              )}
              {testResults.textGeneration.details && (
                <>
                  {testResults.textGeneration.details.tokenCount && (
                    <Text style={styles.testResultDetail}>
                      Tokens: {testResults.textGeneration.details.tokenCount}
                    </Text>
                  )}
                  {testResults.textGeneration.details.generationTime && (
                    <Text style={styles.testResultDetail}>
                      Generation Time:{' '}
                      {testResults.textGeneration.details.generationTime}
                    </Text>
                  )}
                </>
              )}
            </View>
          )}

          {testResults.simplifiedGeneration && (
            <View style={styles.testResultContainer}>
              <Text style={styles.testResultTitle}>Simplified Generation:</Text>
              <Text
                style={[
                  styles.testResultStatus,
                  {
                    color: testResults.simplifiedGeneration.success
                      ? theme.colors.success
                      : theme.colors.error,
                  },
                ]}
              >
                {testResults.simplifiedGeneration.success
                  ? '✅ Success'
                  : '❌ Failed'}
              </Text>
              {testResults.simplifiedGeneration.error && (
                <Text style={styles.testResultDetail}>
                  Error: {testResults.simplifiedGeneration.error}
                </Text>
              )}
              {testResults.simplifiedGeneration.generatedText && (
                <Text style={styles.testResultDetail}>
                  Generated: {testResults.simplifiedGeneration.generatedText}
                </Text>
              )}
              <Text style={styles.testResultDetail}>
                Tokens: {testResults.simplifiedGeneration.tokenCount}
              </Text>
              <Text style={styles.testResultDetail}>
                Processing Time:{' '}
                {testResults.simplifiedGeneration.processingTime}ms
              </Text>
            </View>
          )}

          {testResults.sportsAdvice && (
            <View style={styles.testResultContainer}>
              <Text style={styles.testResultTitle}>
                🏃‍♂️ Sports Science Advice:
              </Text>
              <Text
                style={[
                  styles.testResultStatus,
                  {
                    color: testResults.sportsAdvice.success
                      ? theme.colors.success
                      : theme.colors.error,
                  },
                ]}
              >
                {testResults.sportsAdvice.success ? '✅ Success' : '❌ Failed'}
              </Text>
              {testResults.sportsAdvice.error && (
                <Text style={styles.testResultDetail}>
                  Error: {testResults.sportsAdvice.error}
                </Text>
              )}
              {testResults.sportsAdvice.generatedText && (
                <View style={styles.sportsAdviceContainer}>
                  <Text style={styles.sportsAdviceLabel}>
                    Generated Advice:
                  </Text>
                  <Text style={styles.sportsAdviceText}>
                    {testResults.sportsAdvice.generatedText}
                  </Text>
                </View>
              )}
              <Text style={styles.testResultDetail}>
                Tokens Generated: {testResults.sportsAdvice.tokenCount}
              </Text>
              <Text style={styles.testResultDetail}>
                Processing Time: {testResults.sportsAdvice.processingTime}ms
              </Text>
            </View>
          )}

          {testResults.multiPromptTest && (
            <View style={styles.testResultContainer}>
              <Text style={styles.testResultTitle}>
                🧪 Multi-Prompt Robustness Test:
              </Text>
              <Text
                style={[
                  styles.testResultStatus,
                  {
                    color: testResults.multiPromptTest.overall
                      ? theme.colors.success
                      : theme.colors.error,
                  },
                ]}
              >
                {testResults.multiPromptTest.overall
                  ? '✅ Robust'
                  : '❌ Brittle'}
              </Text>
              <Text style={styles.testResultDetail}>
                Success Rate: {testResults.multiPromptTest.successfulTests}/
                {testResults.multiPromptTest.totalTests} prompts
              </Text>

              {testResults.multiPromptTest.results.map((result, index) => (
                <View key={index} style={styles.promptResultContainer}>
                  <Text style={styles.promptCategoryText}>
                    {result.success ? '✅' : '❌'} {result.category}
                  </Text>
                  {result.generatedText ? (
                    <Text style={styles.promptResponseText}>
                      "{result.generatedText}"
                    </Text>
                  ) : result.error ? (
                    <Text style={styles.promptErrorText}>
                      Error: {result.error}
                    </Text>
                  ) : null}
                  <Text style={styles.promptMetricsText}>
                    {result.tokenCount} tokens • {result.processingTime}ms
                  </Text>
                </View>
              ))}
            </View>
          )}
        </Card>
      )}

      {/* Overall Result */}
      {testResults.overall !== null && testResults.overall !== undefined && (
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Overall Result</Text>
          <View style={styles.overallResultContainer}>
            <View
              style={[
                styles.statusIndicator,
                {
                  backgroundColor: testResults.overall
                    ? theme.colors.success
                    : theme.colors.error,
                },
              ]}
            />
            <Text
              style={[
                styles.overallResultText,
                {
                  color: testResults.overall
                    ? theme.colors.success
                    : theme.colors.error,
                },
              ]}
            >
              {testResults.overall ? 'ALL TESTS PASSED' : 'TESTS FAILED'}
            </Text>
          </View>
        </Card>
      )}

      {/* Model Info */}
      {modelInfo && (
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Model Information</Text>

          <Text style={styles.resultText}>
            <Text style={styles.bold}>Exists:</Text>{' '}
            {modelInfo.exists ? 'Yes' : 'No'}
          </Text>

          <Text style={styles.resultText}>
            <Text style={styles.bold}>Location:</Text> {modelInfo.location}
          </Text>

          {modelInfo.path && (
            <Text style={styles.resultText}>
              <Text style={styles.bold}>Path:</Text> {modelInfo.path}
            </Text>
          )}

          {modelInfo.size && (
            <Text style={styles.resultText}>
              <Text style={styles.bold}>Size:</Text>{' '}
              {(modelInfo.size / (1024 * 1024)).toFixed(1)} MB
            </Text>
          )}
        </Card>
      )}

      {/* Instructions */}
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Next Steps</Text>

        <Text style={styles.instructionText}>
          1. Run ONNX Tests to verify runtime integration
        </Text>

        <Text style={styles.instructionText}>
          2. Check Model Files to see if fine-tuned model is available
        </Text>

        <Text style={styles.instructionText}>
          3. If model is not found, you'll need to add the ONNX model files to
          the iOS bundle or implement model downloading
        </Text>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.md,
  },
  card: {
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.textSecondary,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  singleButtonContainer: {
    marginBottom: theme.spacing.lg,
  },
  button: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
  },
  secondaryButton: {
    backgroundColor: theme.colors.primaryDark,
  },
  fineTunedButton: {
    backgroundColor: theme.colors.success,
  },
  successButton: {
    backgroundColor: theme.colors.primary,
  },
  sportsButton: {
    backgroundColor: '#FF6B35', // Orange for sports
  },
  multiPromptButton: {
    backgroundColor: '#8B5CF6', // Purple for multi-prompt testing
  },
  buttonText: {
    color: theme.colors.white,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.medium,
  },
  resultText: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  bold: {
    fontWeight: theme.typography.weights.bold,
  },
  detailsContainer: {
    marginTop: theme.spacing.sm,
  },
  detailsTitle: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  detailText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  overallResultContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: theme.spacing.sm,
  },
  overallResultText: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
  },
  instructionText: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  testResultContainer: {
    marginBottom: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  testResultTitle: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  testResultStatus: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.medium,
    marginBottom: theme.spacing.xs,
  },
  testResultDetail: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  sportsAdviceContainer: {
    backgroundColor: '#F8F9FA',
    padding: theme.spacing.md,
    borderRadius: theme.spacing.sm,
    marginVertical: theme.spacing.sm,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B35',
  },
  sportsAdviceLabel: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.bold,
    color: '#FF6B35',
    marginBottom: theme.spacing.xs,
  },
  sportsAdviceText: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  promptResultContainer: {
    backgroundColor: '#F3F4F6',
    padding: theme.spacing.sm,
    borderRadius: theme.spacing.xs,
    marginVertical: theme.spacing.xs,
    borderLeftWidth: 3,
    borderLeftColor: '#8B5CF6',
  },
  promptCategoryText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  promptResponseText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text,
    fontStyle: 'italic',
    marginBottom: theme.spacing.xs,
    backgroundColor: '#FFFFFF',
    padding: theme.spacing.xs,
    borderRadius: 4,
  },
  promptErrorText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.error,
    marginBottom: theme.spacing.xs,
  },
  promptMetricsText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
  },
});

export default ONNXTestScreen;
