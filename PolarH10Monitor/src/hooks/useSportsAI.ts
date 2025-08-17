import { useState, useEffect, useCallback } from 'react';
import { sportsAIService, SportsAIResponse, SportsContext } from '../services';
import { logger } from '../utils/logger';

export interface UseSportsAIReturn {
  isInitialized: boolean;
  isLoading: boolean;
  askQuestion: (
    question: string,
    context?: SportsContext,
  ) => Promise<SportsAIResponse | null>;
  getHeartRateAdvice: (
    heartRate: number,
    restingHR?: number,
    maxHR?: number,
  ) => Promise<SportsAIResponse | null>;
  getCommonQuestions: () => string[];
  error: string | null;
  clearError: () => void;
}

export const useSportsAI = (): UseSportsAIReturn => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize the service on mount
  useEffect(() => {
    const initializeService = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (!sportsAIService.isReady()) {
          logger.info('Initializing Sports AI Service...');
          await sportsAIService.initialize();
        }

        setIsInitialized(true);
        logger.info('Sports AI Service ready');
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Failed to initialize AI service';
        logger.error('Failed to initialize Sports AI Service', { error: err });
        setError(errorMessage);
        setIsInitialized(false);
      } finally {
        setIsLoading(false);
      }
    };

    // Add a small delay to prevent blocking the UI thread
    const timer = setTimeout(() => {
      initializeService();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const askQuestion = useCallback(
    async (
      question: string,
      context?: SportsContext,
    ): Promise<SportsAIResponse | null> => {
      if (!isInitialized) {
        setError('AI service not initialized');
        return null;
      }

      try {
        setIsLoading(true);
        setError(null);

        const response = await sportsAIService.askSportsQuestion(
          question,
          context,
        );
        return response;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to get AI response';
        logger.error('Failed to ask question', { error: err, question });
        setError(errorMessage);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [isInitialized],
  );

  const getHeartRateAdvice = useCallback(
    async (
      heartRate: number,
      restingHR?: number,
      maxHR?: number,
    ): Promise<SportsAIResponse | null> => {
      if (!isInitialized) {
        setError('AI service not initialized');
        return null;
      }

      try {
        setIsLoading(true);
        setError(null);

        const response = await sportsAIService.getHeartRateAdvice(
          heartRate,
          restingHR,
          maxHR,
        );
        return response;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Failed to get heart rate advice';
        logger.error('Failed to get heart rate advice', {
          error: err,
          heartRate,
        });
        setError(errorMessage);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [isInitialized],
  );

  const getCommonQuestions = useCallback((): string[] => {
    return sportsAIService.getCommonQuestions();
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isInitialized,
    isLoading,
    askQuestion,
    getHeartRateAdvice,
    getCommonQuestions,
    error,
    clearError,
  };
};
