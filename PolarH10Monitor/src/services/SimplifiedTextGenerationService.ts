/**
 * Simplified Text Generation Service
 * Clean architecture based on Gemini's recommendation with proven ONNX loading
 */

import { InferenceSession, Tensor } from 'onnxruntime-react-native';
import { ONNXModelManager } from './ONNXModelManager';
import {
  decodeTokenIds,
  VOCABULARY_INFO,
  ID_TO_TOKEN,
} from './extractedVocabulary';
import { logger } from '../utils/logger';

export interface TextGenerationResult {
  success: boolean;
  generatedText: string;
  tokenCount: number;
  processingTime: number;
  error?: string;
}

export interface GenerationConfig {
  maxTokens: number;
  temperature: number;
  stopTokenIds: number[];
}

class SimplifiedTextGenerationService {
  private static instance: SimplifiedTextGenerationService;
  private session: InferenceSession | null = null;
  private isInitialized = false;

  private constructor() {}

  static getInstance(): SimplifiedTextGenerationService {
    if (!SimplifiedTextGenerationService.instance) {
      SimplifiedTextGenerationService.instance =
        new SimplifiedTextGenerationService();
    }
    return SimplifiedTextGenerationService.instance;
  }

  /**
   * Initialize the service with ONNX model
   */
  async initialize(): Promise<boolean> {
    try {
      logger.info('🚀 Initializing Simplified Text Generation Service...');

      // Use our proven model loading approach
      const modelInfo = await ONNXModelManager.getModelInfo();
      if (!modelInfo.exists || !modelInfo.path) {
        logger.error('❌ Model files not found');
        return false;
      }

      logger.info('🧠 Loading ONNX model...');
      this.session = await InferenceSession.create(modelInfo.path);

      logger.info(
        `✅ Using extracted vocabulary with ${VOCABULARY_INFO.vocabSize} tokens`,
      );

      this.isInitialized = true;
      logger.info(
        '✅ Simplified Text Generation Service initialized successfully',
      );
      return true;
    } catch (error) {
      logger.error('❌ Failed to initialize text generation service:', error);
      this.isInitialized = false;
      return false;
    }
  }

  /**
   * Enhanced sports science text generation with proper prompt handling
   */
  async generateSportsAdvice(
    prompt: string,
    maxTokens: number = 150,
  ): Promise<TextGenerationResult> {
    if (!this.isInitialized || !this.session) {
      return {
        success: false,
        generatedText: '',
        tokenCount: 0,
        processingTime: 0,
        error: 'Service not initialized',
      };
    }

    const startTime = Date.now();

    try {
      logger.info(`🏃‍♂️ Generating sports science advice for: "${prompt}"`);

      // Create a structured sports science prompt using the actual user prompt
      const sportsPrompt = `<|im_start|>system
You are a sports science expert. Provide specific, accurate advice about training, heart rate zones, and exercise physiology. Give concrete numbers and actionable guidance.
<|im_end|>
<|im_start|>user
${prompt}
<|im_end|>
<|im_start|>assistant
`;

      // Use a simple but better prompt tokenization
      const inputTokens = this.tokenizeWithExtractedVocab(sportsPrompt);
      const generatedTokens: number[] = [];

      logger.info(`📝 Sports prompt: ${inputTokens.length} tokens`);

      // Start with initial sequence
      let currentSequence = [...inputTokens];

      // Generate tokens for complete sports advice
      for (let step = 0; step < maxTokens; step++) {
        logger.info(`🔄 Generation step ${step + 1}/${maxTokens}`);

        // Prepare tensors
        const batchSize = 1;
        const sequenceLength = currentSequence.length;

        const inputIds = new Tensor(
          'int64',
          new BigInt64Array(currentSequence.map(t => BigInt(t))),
          [batchSize, sequenceLength],
        );
        const attentionMask = new Tensor(
          'int64',
          new BigInt64Array(Array(sequenceLength).fill(BigInt(1))),
          [batchSize, sequenceLength],
        );
        const positionIds = new Tensor(
          'int64',
          new BigInt64Array(
            Array.from({ length: sequenceLength }, (_, i) => BigInt(i)),
          ),
          [batchSize, sequenceLength],
        );

        // Build feeds
        const feeds: { [key: string]: Tensor } = {
          input_ids: inputIds,
          attention_mask: attentionMask,
          position_ids: positionIds,
        };

        // Add empty past key values for all 28 layers
        for (let layer = 0; layer < 28; layer++) {
          const emptyCache = new Tensor('float32', new Float32Array(0), [
            batchSize,
            2,
            0,
            128,
          ]);
          feeds[`past_key_values.${layer}.key`] = emptyCache;
          feeds[`past_key_values.${layer}.value`] = emptyCache;
        }

        // Run inference
        const results = await this.session.run(feeds);
        const logits = results.logits as Tensor;

        // Get the next token (last token in sequence)
        const logitsData = logits.data as Float32Array;
        const vocabSize = logits.dims[2] as number;
        const lastTokenLogits = logitsData.slice(-vocabSize);

        // Use smart sampling with higher temperature for more creativity
        const nextToken = this.smartSample(
          lastTokenLogits,
          generatedTokens,
          1.2,
        );

        logger.info(`✨ Generated token: ${nextToken}`);
        generatedTokens.push(nextToken);
        currentSequence.push(nextToken);

        // Check for stop tokens (end of message)
        if (nextToken === 151645) {
          // <|im_end|>
          logger.info('🛑 Stop token reached');
          break;
        }
      }

      // Decode the generated tokens to text
      const rawText = await this.enhancedDetokenize(generatedTokens);

      // Clean up formatting artifacts
      const generatedText = this.cleanGeneratedText(rawText);

      const processingTime = Date.now() - startTime;

      logger.info(
        `✅ Sports advice generation completed in ${processingTime}ms`,
      );
      logger.info(`🏆 Generated text: "${generatedText}"`);

      return {
        success: true,
        generatedText,
        tokenCount: generatedTokens.length,
        processingTime,
      };
    } catch (error) {
      const processingTime = Date.now() - startTime;
      logger.error('❌ Sports advice generation failed:', error);

      return {
        success: false,
        generatedText: '',
        tokenCount: 0,
        processingTime,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Simple but effective tokenization using the extracted vocabulary
   */
  private tokenizeWithExtractedVocab(text: string): number[] {
    // Create reverse lookup from token to ID
    const tokenToId = new Map<string, number>();
    Object.entries(ID_TO_TOKEN).forEach(([id, token]) => {
      tokenToId.set(token, parseInt(id));
    });

    const tokens: number[] = [];

    // Handle special tokens first
    if (text.includes('<|im_start|>')) {
      const parts = text.split('<|im_start|>');
      for (let i = 0; i < parts.length; i++) {
        if (i > 0) {
          tokens.push(151644); // <|im_start|>
        }
        const part = parts[i];
        if (part) {
          tokens.push(...this.tokenizeText(part, tokenToId));
        }
      }
    } else {
      tokens.push(...this.tokenizeText(text, tokenToId));
    }

    logger.info(
      `📝 Tokenized "${text.substring(0, 50)}..." into ${tokens.length} tokens`,
    );
    return tokens;
  }

  /**
   * Tokenize regular text using greedy longest-match approach
   */
  private tokenizeText(text: string, tokenToId: Map<string, number>): number[] {
    const tokens: number[] = [];
    let remaining = text;

    while (remaining.length > 0) {
      let found = false;

      // Try to find the longest matching token (greedy approach)
      for (let len = Math.min(remaining.length, 20); len > 0; len--) {
        const substr = remaining.substring(0, len);
        const tokenId = tokenToId.get(substr);

        if (tokenId !== undefined) {
          tokens.push(tokenId);
          remaining = remaining.substring(len);
          found = true;
          break;
        }
      }

      if (!found) {
        // Fallback: try single character or skip
        const char = remaining.charAt(0);
        const charId = tokenToId.get(char);
        if (charId !== undefined) {
          tokens.push(charId);
        } else {
          // Map to space if unknown
          const spaceId = tokenToId.get('Ġ'); // BPE space token
          if (spaceId !== undefined) {
            tokens.push(spaceId);
          }
        }
        remaining = remaining.substring(1);
      }
    }

    return tokens;
  }

  /**
   * Simple sports science specific tokenization (keeping for backwards compatibility)
   */
  private simpleSportsTokenize(text: string): number[] {
    // For now, use a simple approximation
    // In a real system, we'd use the actual Qwen tokenizer
    const words = text.split(/\s+/);
    const tokens: number[] = [];

    // Map common sports science terms to approximate token IDs
    const sportsTokenMap: { [key: string]: number } = {
      '<|im_start|>': 151644,
      '<|im_end|>': 151645,
      system: 1159,
      user: 872,
      assistant: 29186,
      sports: 6982,
      science: 8198,
      expert: 6429,
      heart: 5537,
      rate: 4478,
      training: 4865,
      exercise: 6534,
      fitness: 17479,
      zone: 10353,
      intensity: 23800,
      cardio: 5057,
      strength: 8333,
      muscle: 16124,
      recovery: 14379,
      performance: 5199,
      nutrition: 26677,
      hydration: 37636,
      fatigue: 36709,
      endurance: 49980,
      speed: 4632,
      power: 2410,
      You: 1482,
      are: 527,
      a: 264,
      Provide: 40665,
      clear: 2870,
      evidence: 6029,
      based: 3196,
      advice: 9650,
      What: 3923,
      How: 2650,
      Why: 10445,
      is: 374,
      the: 279,
      and: 323,
      for: 369,
      to: 311,
      in: 304,
      of: 315,
      with: 449,
      best: 1888,
      optimal: 23669,
      effective: 7524,
      improve: 7417,
      increase: 5376,
      reduce: 8108,
      prevent: 5471,
      enhance: 18885,
    };

    for (const word of words) {
      const cleanWord = word.trim();
      if (cleanWord) {
        const tokenId = sportsTokenMap[cleanWord];
        if (tokenId !== undefined) {
          tokens.push(tokenId);
        } else {
          // Use simple character-based approximation for unknown words
          for (let i = 0; i < cleanWord.length; i++) {
            tokens.push(cleanWord.charCodeAt(i) + 100);
          }
        }
      }
    }

    return tokens;
  }

  /**
   * Generate text using simple tokenization and proven tensor approach
   */
  async generateText(
    prompt: string,
    config: GenerationConfig,
  ): Promise<TextGenerationResult> {
    if (!this.isInitialized || !this.session) {
      return {
        success: false,
        generatedText: '',
        tokenCount: 0,
        processingTime: 0,
        error: 'Service not initialized',
      };
    }

    const startTime = Date.now();

    try {
      logger.info('🎯 Starting simplified text generation...');

      // Simple static tokenization - avoid complex tokenizer recursion
      const inputTokens = this.simpleTokenize(prompt);
      const generatedTokens: number[] = [];

      logger.info(`📝 Input: ${inputTokens.length} tokens`);

      // Start with initial full sequence inference
      let currentSequence = [...inputTokens];

      // Generate multiple tokens one by one
      for (let step = 0; step < config.maxTokens; step++) {
        logger.info(`🔄 Generation step ${step + 1}/${config.maxTokens}`);

        // Prepare tensors for current sequence
        const batchSize = 1;
        const sequenceLength = currentSequence.length;

        const inputIds = new Tensor(
          'int64',
          new BigInt64Array(currentSequence.map(t => BigInt(t))),
          [batchSize, sequenceLength],
        );
        const attentionMask = new Tensor(
          'int64',
          new BigInt64Array(Array(sequenceLength).fill(BigInt(1))),
          [batchSize, sequenceLength],
        );
        const positionIds = new Tensor(
          'int64',
          new BigInt64Array(
            Array.from({ length: sequenceLength }, (_, i) => BigInt(i)),
          ),
          [batchSize, sequenceLength],
        );

        // Build feeds with empty past key values (proven working approach)
        const feeds: { [key: string]: Tensor } = {
          input_ids: inputIds,
          attention_mask: attentionMask,
          position_ids: positionIds,
        };

        // Add empty past key values for all 28 layers
        for (let layer = 0; layer < 28; layer++) {
          const emptyCache = new Tensor('float32', new Float32Array(0), [
            batchSize,
            2,
            0,
            128,
          ]);
          feeds[`past_key_values.${layer}.key`] = emptyCache;
          feeds[`past_key_values.${layer}.value`] = emptyCache;
        }

        // Run inference
        const results = await this.session.run(feeds);

        // Extract logits
        if (!('logits' in results)) {
          throw new Error('No logits in model output');
        }

        const logits = results.logits as Tensor;
        const logitsData = logits.data as Float32Array;

        // Use smart sampling with higher temperature for more creative content
        const vocabSize = 151936;
        const lastTokenLogits = logitsData.slice(-vocabSize);
        const nextToken = this.smartSample(
          lastTokenLogits,
          generatedTokens,
          1.2,
        );

        logger.info(`🎲 Generated token: ${nextToken}`);

        // Check for stop tokens
        if (config.stopTokenIds.includes(nextToken)) {
          logger.info('🛑 Hit stop token, ending generation');
          break;
        }

        generatedTokens.push(nextToken);
        currentSequence.push(nextToken); // Add to sequence for next iteration

        // Limit sequence length to prevent memory issues
        if (currentSequence.length > 200) {
          logger.info('⚡ Truncating sequence to prevent memory issues');
          currentSequence = currentSequence.slice(-150); // Keep last 150 tokens
        }
      }

      // Enhanced detokenization using QwenTokenizerService
      const generatedText = await this.enhancedDetokenize(generatedTokens);
      const processingTime = Date.now() - startTime;

      logger.info(
        `✅ Text generation completed: ${generatedTokens.length} tokens in ${processingTime}ms`,
      );
      logger.info(`🎯 Generated text: "${generatedText}"`);

      return {
        success: true,
        generatedText,
        tokenCount: generatedTokens.length,
        processingTime,
      };
    } catch (error) {
      const processingTime = Date.now() - startTime;
      logger.error('❌ Text generation failed:', error);

      return {
        success: false,
        generatedText: '',
        tokenCount: 0,
        processingTime,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Simple tokenization - no recursion, no complex logic
   */
  private simpleTokenize(text: string): number[] {
    // Create a basic sports science prompt with known working tokens
    const sportsPrompt = [
      151644, // <|im_start|>
      9125, // system
      198, // \n
      2675, // "You"
      527, // "are"
      459, // "a"
      10178, // "sports"
      8198, // "science"
      6264, // "expert"
      151645, // <|im_end|>
      198, // \n
      151644, // <|im_start|>
      882, // user
      198, // \n
      // Add some tokens representing the user query
      39,
      50,
      51,
      45,
      4618,
      2593,
      36779,
      706, // Basic representation
      151645, // <|im_end|>
      198, // \n
      151644, // <|im_start|>
      78098, // assistant
    ];

    logger.info(`🔤 Using static tokenization: ${sportsPrompt.length} tokens`);
    return sportsPrompt;
  }

  /**
   * Enhanced detokenization - convert token IDs back to text using CustomQWenTokenizer
   */
  private async enhancedDetokenize(tokens: number[]): Promise<string> {
    try {
      // Log the raw tokens for debugging
      logger.info(`🔤 Raw tokens to decode: ${tokens.join(', ')}`);

      // Use the extracted vocabulary for proper decoding
      const decodedText = decodeTokenIds(tokens);

      if (decodedText && decodedText.length > 0) {
        logger.info(`📝 Extracted vocabulary decoded: "${decodedText}"`);
        return decodedText;
      } else {
        // If decoded text is empty, show the token IDs for debugging
        const tokenDisplay = tokens.map(t => `[${t}]`).join(' ');
        logger.warn(`⚠️ Empty decode result for tokens: ${tokenDisplay}`);
        return `Generated tokens: ${tokenDisplay}`;
      }
    } catch (error) {
      logger.error('❌ Vocabulary decode failed:', error);

      // Simple fallback - just show token IDs
      const tokenDisplay = tokens.map(t => `[${t}]`).join(' ');
      return `Tokens: ${tokenDisplay}`;
    }
  }

  /**
   * Check if token represents punctuation
   */
  private isPunctuation(token: number): boolean {
    const punctuationTokens = [13, 11, 30, 0, 25, 26]; // . , ? ! : ;
    return punctuationTokens.includes(token);
  }

  /**
   * Simple detokenization - convert token IDs back to text
   */
  private simpleDetokenize(tokens: number[]): string {
    // Basic mapping for common tokens (sports science domain)
    const tokenMap: { [key: number]: string } = {
      151644: '<|im_start|>',
      151645: '<|im_end|>',
      198: '\n',
      220: ' ',
      39: 'A',
      50: '2',
      51: '3',
      527: 'are',
      706: 'heart',
      4618: 'rate',
      2593: 'training',
      36779: 'zones',
      1276: 'for',
      24635: 'endurance',
      16048: 'improvement',
      6511: 'based',
      389: 'on',
      701: 'your',
      4325: 'age',
      323: 'and',
      17479: 'fitness',
      2237: 'level',
    };

    let result = '';
    for (const token of tokens) {
      if (tokenMap[token]) {
        result += tokenMap[token];
      } else {
        // For unknown tokens, use a placeholder
        result += `[${token}]`;
      }
    }

    return result.trim();
  }

  /**
   * Improved sampling with temperature and repetition penalty
   */
  private smartSample(
    logits: Float32Array,
    generatedTokens: number[],
    temperature: number = 0.8,
  ): number {
    // Apply repetition penalty to discourage repeating tokens
    const penalizedLogits = new Float32Array(logits.length);
    for (let i = 0; i < logits.length; i++) {
      const logitValue = logits[i];
      if (logitValue === undefined) {
        penalizedLogits[i] = 0;
        continue;
      }

      penalizedLogits[i] = logitValue;

      // Count how many times this token was recently generated
      const recentCount = generatedTokens
        .slice(-10)
        .filter(token => token === i).length;
      if (recentCount > 0) {
        // Apply penalty - reduce probability for repeated tokens
        const currentValue = penalizedLogits[i];
        if (currentValue !== undefined) {
          penalizedLogits[i] = currentValue - recentCount * 2.0; // Strong penalty
        }
      }

      // Discourage special tokens during content generation
      const specialTokens = [151644, 151645, 198, 0, 1, 2]; // <|im_start|>, <|im_end|>, \n, <pad>, <unk>, <s>
      if (specialTokens.includes(i)) {
        const currentValue = penalizedLogits[i];
        if (currentValue !== undefined) {
          penalizedLogits[i] = currentValue - 5.0; // Strong penalty for special tokens
        }
      }
    }

    // Apply temperature scaling for more diverse sampling
    if (temperature > 0) {
      for (let i = 0; i < penalizedLogits.length; i++) {
        const currentValue = penalizedLogits[i];
        if (currentValue !== undefined) {
          penalizedLogits[i] = currentValue / temperature;
        }
      }
    }

    // Convert logits to probabilities using softmax (simplified)
    let maxLogit = -Infinity;
    for (let i = 0; i < penalizedLogits.length; i++) {
      const logitValue = penalizedLogits[i];
      if (logitValue !== undefined && logitValue > maxLogit) {
        maxLogit = logitValue;
      }
    }

    // Softmax with numerical stability
    const expValues = new Float32Array(penalizedLogits.length);
    let sumExp = 0;
    for (let i = 0; i < penalizedLogits.length; i++) {
      const logitValue = penalizedLogits[i];
      if (logitValue !== undefined) {
        const expValue = Math.exp(logitValue - maxLogit);
        expValues[i] = expValue;
        sumExp += expValue;
      }
    }

    // Normalize to probabilities
    const probabilities = new Float32Array(penalizedLogits.length);
    for (let i = 0; i < penalizedLogits.length; i++) {
      const expValue = expValues[i];
      if (expValue !== undefined) {
        probabilities[i] = expValue / sumExp;
      }
    }

    // Top-k sampling: only consider top 50 tokens
    const topK = 50;
    const indexed = Array.from(probabilities).map((prob, idx) => ({
      prob,
      idx,
    }));
    indexed.sort((a, b) => b.prob - a.prob);

    // Sample from top-k tokens
    const topTokens = indexed.slice(0, topK);
    const topProbSum = topTokens.reduce((sum, item) => sum + item.prob, 0);

    // Normalize top-k probabilities
    topTokens.forEach(item => {
      item.prob /= topProbSum;
    });

    // Random sampling from top-k
    const random = Math.random();
    let cumulative = 0;
    for (const item of topTokens) {
      cumulative += item.prob;
      if (random <= cumulative) {
        return item.idx;
      }
    }

    // Fallback to highest probability token
    if (topTokens.length > 0 && topTokens[0]) {
      return topTokens[0].idx;
    }

    // Ultimate fallback
    return 0;
  }

  /**
   * Simple greedy sampling (kept for fallback)
   */
  private greedySample(logits: Float32Array): number {
    let maxIndex = 0;
    let maxValue = -Infinity;

    for (let i = 0; i < logits.length; i++) {
      const logitValue = logits[i];
      if (logitValue !== undefined && logitValue > maxValue) {
        maxValue = logitValue;
        maxIndex = i;
      }
    }

    return maxIndex;
  }

  /**
   * Get service status
   */
  getStatus(): { initialized: boolean; sessionReady: boolean } {
    return {
      initialized: this.isInitialized,
      sessionReady: this.session !== null,
    };
  }

  /**
   * Clean up formatting artifacts and improve text quality
   */
  private cleanGeneratedText(text: string): string {
    let cleaned = text;

    // Remove common formatting artifacts
    cleaned = cleaned
      // Remove standalone C1, C2, C3, etc. (citation markers)
      .replace(/\bC\d+\b\.?\s*/g, '')
      // Remove CC patterns
      .replace(/\bCC\d*\b\.?\s*/g, '')
      // Remove isolated periods and numbers
      .replace(/\s+\d+\.\s*$/, '')
      // Remove trailing incomplete words
      .replace(/\s+\w{1,2}$/, '')
      // Clean up extra spaces
      .replace(/\s+/g, ' ')
      // Remove leading/trailing whitespace
      .trim();

    // If text ends mid-sentence, try to complete it gracefully
    if (cleaned.length > 0 && !cleaned.match(/[.!?]$/)) {
      // If it ends with a word, add a period
      if (cleaned.match(/\w$/)) {
        cleaned += '.';
      }
    }

    // Capitalize first letter if needed
    if (cleaned.length > 0) {
      cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    }

    return cleaned;
  }

  /**
   * Clean up resources
   */
  async cleanup(): Promise<void> {
    if (this.session) {
      await this.session.release();
      this.session = null;
    }
    this.isInitialized = false;
    logger.info('🧹 Simplified Text Generation Service cleaned up');
  }
}

export const simplifiedTextGenerationService =
  SimplifiedTextGenerationService.getInstance();
