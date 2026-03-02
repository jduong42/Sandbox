// Adapter for the existing LlamaTextGenerationService to work with SML Chat interface
import {
  llamaTextGenerationService,
  LlamaGenerationResult,
} from './LlamaTextGenerationService';
import { logger } from '../utils/logger';

export interface SportsAIResponse {
  response: string;
  confidence: number;
  category: string;
  timestamp: Date;
  tokenCount?: number;
  processingTime?: number;
}

export interface SportsContext {
  heartRate?: number;
  restingHeartRate?: number;
  maxHeartRate?: number;
  activityType?: string;
  duration?: number;
  intensity?: 'low' | 'moderate' | 'high' | 'maximum';
}

class SportsAIService {
  private initialized = false;

  async initialize(): Promise<void> {
    try {
      const success = await llamaTextGenerationService.initialize();
      if (success) {
        this.initialized = true;
        logger.info('SportsAI adapter initialized successfully');
      } else {
        throw new Error('Failed to initialize Llama service');
      }
    } catch (error) {
      logger.error('Failed to initialize SportsAI adapter:', error);
      throw error;
    }
  }

  isReady(): boolean {
    return this.initialized;
  }

  async askSportsQuestion(
    question: string,
    context?: SportsContext,
  ): Promise<SportsAIResponse> {
    if (!this.initialized) {
      throw new Error('Service not initialized');
    }

    try {
      // Create enhanced prompt with context
      let enhancedPrompt = question;

      if (context) {
        const contextInfo = [];
        if (context.heartRate)
          contextInfo.push(`Current heart rate: ${context.heartRate} bpm`);
        if (context.restingHeartRate)
          contextInfo.push(
            `Resting heart rate: ${context.restingHeartRate} bpm`,
          );
        if (context.maxHeartRate)
          contextInfo.push(`Max heart rate: ${context.maxHeartRate} bpm`);
        if (context.activityType)
          contextInfo.push(`Activity: ${context.activityType}`);
        if (context.duration)
          contextInfo.push(`Duration: ${context.duration} minutes`);
        if (context.intensity)
          contextInfo.push(`Intensity: ${context.intensity}`);

        if (contextInfo.length > 0) {
          enhancedPrompt = `Context: ${contextInfo.join(
            ', ',
          )}\n\nQuestion: ${question}`;
        }
      }

      const result: LlamaGenerationResult =
        await llamaTextGenerationService.generateSportsAdvice(
          enhancedPrompt,
          200, // Max tokens for chat responses
        );

      if (!result.success) {
        throw new Error(result.error || 'Failed to generate response');
      }

      // Categorize the response based on content
      const category = this.categorizeResponse(question, result.generatedText);

      return {
        response: result.generatedText,
        confidence: 0.9, // High confidence since using fine-tuned model
        category,
        timestamp: new Date(),
        tokenCount: result.tokenCount,
        processingTime: result.processingTime,
      };
    } catch (error) {
      logger.error('Failed to ask sports question:', error);
      throw error;
    }
  }

  async getHeartRateAdvice(
    heartRate: number,
    restingHR?: number,
    maxHR?: number,
  ): Promise<SportsAIResponse> {
    if (!this.initialized) {
      throw new Error('Service not initialized');
    }

    try {
      // Create specialized heart rate prompt
      let prompt = `Please analyze this heart rate reading: ${heartRate} bpm`;

      if (restingHR && maxHR) {
        const hrReserve = maxHR - restingHR;
        const percentage = ((heartRate - restingHR) / hrReserve) * 100;
        prompt += `\nResting HR: ${restingHR} bpm, Max HR: ${maxHR} bpm (${Math.round(
          percentage,
        )}% of HR reserve)`;
      }

      prompt +=
        '\n\nWhat does this heart rate indicate about my current exercise intensity and what training recommendations do you have?';

      const result: LlamaGenerationResult =
        await llamaTextGenerationService.generateSportsAdvice(
          prompt,
          180, // Focused response for HR advice
        );

      if (!result.success) {
        throw new Error(result.error || 'Failed to generate heart rate advice');
      }

      return {
        response: result.generatedText,
        confidence: 0.95, // Very high confidence for HR analysis
        category: 'heart_rate_analysis',
        timestamp: new Date(),
        tokenCount: result.tokenCount,
        processingTime: result.processingTime,
      };
    } catch (error) {
      logger.error('Failed to get heart rate advice:', error);
      throw error;
    }
  }

  getCommonQuestions(): string[] {
    return [
      'What heart rate zone should I train in?',
      'How do I improve my cardiovascular fitness?',
      'What is a good resting heart rate?',
      'How do I calculate my maximum heart rate?',
      'What does heart rate variability mean?',
      'How should I structure my training week?',
      'What are the signs of overtraining?',
      'How important is recovery between workouts?',
    ];
  }

  private categorizeResponse(question: string, response: string): string {
    const questionLower = question.toLowerCase();
    const responseLower = response.toLowerCase();

    if (
      questionLower.includes('heart rate') ||
      responseLower.includes('heart rate')
    ) {
      return 'heart_rate';
    } else if (
      questionLower.includes('zone') ||
      responseLower.includes('zone')
    ) {
      return 'training_zones';
    } else if (
      questionLower.includes('training') ||
      questionLower.includes('workout')
    ) {
      return 'training';
    } else if (
      questionLower.includes('recovery') ||
      responseLower.includes('recovery')
    ) {
      return 'recovery';
    } else if (
      questionLower.includes('nutrition') ||
      responseLower.includes('nutrition')
    ) {
      return 'nutrition';
    } else {
      return 'general';
    }
  }

  /**
   * Get service status for debugging
   */
  getStatus() {
    return {
      initialized: this.initialized,
      llamaStatus: llamaTextGenerationService.getStatus(),
    };
  }
}

export const sportsAIService = new SportsAIService();
