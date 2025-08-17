/**
 * useONNXSportsAI.ts - Hook for ONNX-based sports AI functionality
 * Alternative implementation to useSportsAI
 */

import { useState, useCallback, useRef } from 'react';
import { simplifiedTextGenerationService } from '../services/SimplifiedTextGenerationService';
import { logger } from '../utils/logger';

// Define types for backward compatibility
export interface ONNXSportsAIResponse {
  success: boolean;
  advice: string;
  confidence: number;
  processingTime: number;
  error?: string;
}

export interface ONNXSportsContext {
  heartRate?: number;
  age?: number;
  activityType?: string;
  duration?: number;
  intensity?: string;
  question?: string;
  userQuery?: string; // Added for backward compatibility
}

export interface UseONNXSportsAIResult {
  isLoading: boolean;
  response: ONNXSportsAIResponse | null;
  error: string | null;
  generateAdvice: (context: ONNXSportsContext) => Promise<void>;
  clearResponse: () => void;
  modelStatus: any;
}

export const useONNXSportsAI = (): UseONNXSportsAIResult => {
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<ONNXSportsAIResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Track request to prevent duplicate calls
  const activeRequestRef = useRef<Promise<void> | null>(null);

  const generateAdvice = useCallback(async (context: ONNXSportsContext) => {
    // Prevent concurrent requests
    if (activeRequestRef.current) {
      logger.warn('🚫 ONNX Sports AI request already in progress');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResponse(null);

    const requestPromise = (async () => {
      try {
        logger.info('🤖 Requesting ONNX sports advice...', {
          query: context.userQuery,
          heartRate: context.heartRate,
        });

        // Create a question from the context
        const question =
          context.userQuery ||
          context.question ||
          `What advice do you have for ${
            context.activityType || 'exercise'
          } with heart rate ${context.heartRate || 'unknown'}?`;

        const textResult =
          await simplifiedTextGenerationService.generateSportsAdvice(
            question,
            100, // maxTokens
          );

        // Convert to the expected response format
        const result: ONNXSportsAIResponse = {
          success: textResult.success,
          advice: textResult.generatedText,
          confidence: textResult.success ? 0.8 : 0.0,
          processingTime: textResult.processingTime,
          ...(textResult.error && { error: textResult.error }),
        };

        setResponse(result);

        logger.info('✅ ONNX Sports advice received', {
          confidence: result.confidence,
          processingTime: result.processingTime,
        });
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);
        logger.error('❌ ONNX Sports AI error', { error: err });
      } finally {
        setIsLoading(false);
        activeRequestRef.current = null;
      }
    })();

    activeRequestRef.current = requestPromise;
    await requestPromise;
  }, []);

  const clearResponse = useCallback(() => {
    setResponse(null);
    setError(null);
  }, []);

  const modelStatus = simplifiedTextGenerationService.getStatus();

  return {
    isLoading,
    response,
    error,
    generateAdvice,
    clearResponse,
    modelStatus,
  };
};
