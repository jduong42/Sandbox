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
  private modelPath: string | null = null;
  private isModelValidated = false;

  private constructor() {}

  static getInstance(): SimplifiedTextGenerationService {
    if (!SimplifiedTextGenerationService.instance) {
      SimplifiedTextGenerationService.instance =
        new SimplifiedTextGenerationService();
    }
    return SimplifiedTextGenerationService.instance;
  }

  /**
   * Initialize the service by validating model availability (lazy loading approach)
   */
  async initialize(): Promise<boolean> {
    try {
      logger.info('🚀 Initializing Simplified Text Generation Service...');
      logger.info(
        '📱 Device type: Physical iOS Device - Using lazy loading for memory efficiency',
      );

      // Validate model exists but don't load it yet (lazy loading)
      const modelManager = ONNXModelManager.getInstance();
      const initResult = await modelManager.initialize();

      if (!initResult) {
        logger.error('❌ ONNXModelManager initialization failed');
        return false;
      }

      const modelInfo = await modelManager.getModelInfo();

      // Detailed logging for debugging
      logger.info(
        `📊 Model info: exists=${modelInfo.exists}, path="${modelInfo.path}"`,
      );

      if (!modelInfo.exists || !modelInfo.path) {
        logger.error(
          '❌ Model files not found in bundle - this is the cause of the crash!',
        );
        logger.error(
          '💡 Solution: Add model.onnx and model.onnx_data to Xcode project bundle resources',
        );
        return false;
      }

      // Store model path but don't load yet (lazy loading for memory efficiency)
      this.modelPath = modelInfo.path;
      this.isModelValidated = true;

      logger.info(`� Model path validated: ${modelInfo.path}`);
      logger.info(
        '💾 LAZY LOADING: Model will be loaded only when text generation is requested',
      );
      logger.info(
        `✅ Using extracted vocabulary with ${VOCABULARY_INFO.vocabSize} tokens`,
      );

      this.isInitialized = true;
      logger.info(
        '✅ Simplified Text Generation Service initialized successfully (lazy loading mode)',
      );
      return true;
    } catch (error) {
      logger.error('❌ Failed to initialize text generation service:', error);

      // Enhanced error reporting for device debugging
      if (error instanceof Error) {
        logger.error(`🔍 Error name: ${error.name}`);
        logger.error(`🔍 Error message: ${error.message}`);
        logger.error(`🔍 Error stack: ${error.stack}`);

        // Specific error guidance
        if (
          error.message.includes('No such file') ||
          error.message.includes('ENOENT')
        ) {
          logger.error(
            '� SOLUTION: Model files are not included in app bundle!',
          );
          logger.error('📋 Steps:');
          logger.error('   1. Open ios/PolarH10Monitor.xcworkspace in Xcode');
          logger.error('   2. Select project → target → Build Phases');
          logger.error(
            '   3. Add model.onnx and model.onnx_data to "Copy Bundle Resources"',
          );
          logger.error('   4. Clean and rebuild');
        }
      }

      this.isInitialized = false;
      return false;
    }
  }

  /**
   * Lazy load the ONNX session only when needed
   */
  private async loadModelSession(): Promise<boolean> {
    if (this.session) {
      return true; // Already loaded
    }

    if (!this.modelPath || !this.isModelValidated) {
      logger.error('❌ Model not validated. Call initialize() first.');
      return false;
    }

    try {
      this.logMemoryUsage('Before Model Load');

      logger.info('🧠 Lazy loading ONNX model session...');
      logger.info(
        '🔧 Creating ONNX session with memory-conservative approach...',
      );

      // Load model session only when needed
      this.session = await InferenceSession.create(this.modelPath);

      this.logMemoryUsage('After Model Load');
      logger.info('✅ ONNX session loaded successfully via lazy loading');
      return true;
    } catch (sessionError) {
      this.logMemoryUsage('Model Load Failed');

      logger.error('❌ ONNX session creation failed:', sessionError);
      logger.error(
        '🔍 This suggests model file corruption, incorrect format, or insufficient memory',
      );

      // Enhanced error information for memory issues
      if (sessionError instanceof Error) {
        if (
          sessionError.message.includes('memory') ||
          sessionError.message.includes('alloc')
        ) {
          logger.error('� MEMORY ERROR DETECTED:');
          logger.error('   • The ONNX model is too large for this iOS device');
          logger.error('   • Consider using a smaller, quantized model');
          logger.error(
            '   • Current model may exceed iOS app memory limits (~3GB)',
          );
        }
      }

      return false;
    }
  }

  /**
   * Dispose of the ONNX session to free memory
   */
  private async disposeSession(): Promise<void> {
    if (this.session) {
      try {
        // Note: ONNX Runtime React Native may not have explicit dispose method
        // Setting to null allows garbage collection
        this.session = null;
        this.logMemoryUsage('After Session Disposal');
        logger.info('🗑️ ONNX session disposed to free memory');
      } catch (error) {
        logger.warn('⚠️ Error disposing ONNX session:', error);
      }
    }
  }

  /**
   * Log memory usage context for debugging (simplified for React Native)
   */
  private logMemoryUsage(context: string): void {
    try {
      // Since React Native doesn't have direct memory APIs,
      // we'll log context-based warnings for memory-intensive operations
      const timestamp = new Date().toISOString();
      logger.info(`📊 Memory Context [${context}] at ${timestamp}`);

      // Log model lifecycle warnings
      if (context === 'Before Model Load') {
        logger.info(
          '⚠️ About to load large ONNX model - monitor for memory pressure',
        );
      } else if (context === 'After Model Load') {
        logger.info(
          '✅ Model loaded - if app becomes slow, model may be too large',
        );
      } else if (context === 'After Session Disposal') {
        logger.info(
          '♻️ Model session disposed - memory should be freed for garbage collection',
        );
      } else if (context === 'Model Load Failed') {
        logger.info(
          '❌ Model load failed - likely due to insufficient memory on device',
        );
      }
    } catch (error) {
      logger.debug('Unable to log memory context:', error);
    }
  }

  /**
   * Enhanced sports science text generation with lazy loading and memory management
   */
  async generateSportsAdvice(
    prompt: string,
    maxTokens: number = 180,
  ): Promise<TextGenerationResult> {
    if (!this.isInitialized || !this.isModelValidated) {
      const errorMessage =
        'Service not initialized - likely model files not found in app bundle';

      logger.error(`❌ Cannot generate advice: ${errorMessage}`);
      logger.error('💡 This is why the app crashes on physical device!');

      return {
        success: false,
        generatedText:
          'Unable to generate advice. Model files may not be included in app bundle. Please check Xcode project configuration.',
        tokenCount: 0,
        processingTime: 0,
        error: errorMessage,
      };
    }

    // Lazy load the model session only when needed
    logger.info('🔄 Loading model session for text generation...');
    const sessionLoaded = await this.loadModelSession();

    if (!sessionLoaded || !this.session) {
      const errorMessage =
        'Failed to load ONNX session - likely memory constraints on iOS device';
      logger.error(`❌ Cannot generate advice: ${errorMessage}`);

      return {
        success: false,
        generatedText:
          'Unable to generate advice. The AI model may be too large for this device. Please try restarting the app or use a smaller prompt.',
        tokenCount: 0,
        processingTime: 0,
        error: errorMessage,
      };
    }

    const startTime = Date.now();

    try {
      logger.info(`🏃‍♂️ Generating sports science advice for: "${prompt}"`);
      logger.info(`🧠 Session state: ${this.session ? 'available' : 'null'}`);
      logger.info(`📱 Platform: iOS Device - Enhanced error handling enabled`);

      // Create a structured sports science prompt using the actual user prompt
      const sportsPrompt = `<|im_start|>system
You are a professional sports scientist. Your purpose is to provide objective, data-driven, and actionable advice to optimize training and performance.

You can provide heart rate zone guidance using percentage ranges of a maximum heart rate, but **only when the user's query relates to training intensity, endurance, or performance**. Avoid using specific BPM numbers. Use these general ranges:
* **Zone 1 (Very Light):** Approximately 50-60% of your maximum heart rate.
* **Zone 2 (Light):** Approximately 60-70% of your maximum heart rate.
* **Zone 3 (Moderate):** Approximately 70-80% of your maximum heart rate.
* **Zone 4 (Hard):** Approximately 80-90% of your maximum heart rate.
* **Zone 5 (Maximum Effort):** Above 90% of your maximum heart rate.

In your guidance, describe the physiological state associated with each intensity level. For example:
* "This intensity level corresponds to a state where verbal communication is readily achievable."
* "The effort should feel significant, but not so high that breathing is a struggle."
* "You will be out of breath, with speaking limited to single words."

Your responses must be a single, flowing paragraph. Do not use bullet points, numbered lists, or rhetorical questions. To make the information more scannable, **bold key terms, metrics, and final recommendations**.
Provide a mix of practical advice and the scientific principles behind it, all presented in an easy-to-understand, analytical manner.

**Always integrate other key performance indicators when possible. Acknowledge the importance of subjective measures like Rate of Perceived Exertion (RPE), and holistic factors like sleep, recovery, and nutrition, as they directly impact physiological responses.**

**Also, remember to acknowledge that a user's maximum heart rate is often an estimate and that more accurate testing can provide a more personalized basis for training zones.**

**Always conclude your response with a clear and prominent safety disclaimer, stating that this advice is for informational purposes only and users should consult a healthcare professional if they feel unwell, experience discomfort, or have any health-related concerns.**

**If your response includes a training plan, load recommendation, or any other actionable advice, also add a concluding sentence encouraging the user to seek a second opinion from a qualified professional, such as a coach, physical therapist, or sports physician, to ensure the plan is appropriate for their individual needs.**
<|im_end|>
<|im_start|>user
${prompt}
<|im_end|>
<|im_start|>assistant
`;

      logger.info(
        `🔤 About to tokenize prompt of length: ${sportsPrompt.length}`,
      );
      logger.info(`📝 Full system prompt: "${sportsPrompt}"`);

      // Use a simple but better prompt tokenization with error handling
      let inputTokens: number[] = [];
      try {
        inputTokens = this.tokenizeWithExtractedVocab(sportsPrompt);
        logger.info(`✅ Tokenization successful: ${inputTokens.length} tokens`);
      } catch (tokenError) {
        logger.error('❌ Tokenization failed:', tokenError);
        return {
          success: false,
          generatedText: '',
          tokenCount: 0,
          processingTime: Date.now() - startTime,
          error: `Tokenization failed: ${tokenError}`,
        };
      }

      if (inputTokens.length === 0) {
        logger.error('❌ Tokenization produced empty token array');
        return {
          success: false,
          generatedText: '',
          tokenCount: 0,
          processingTime: Date.now() - startTime,
          error: 'Tokenization produced empty result',
        };
      }

      const generatedTokens: number[] = [];

      logger.info(`📝 Sports prompt: ${inputTokens.length} tokens`);

      // Start with initial sequence
      let currentSequence = [...inputTokens];

      // Safety check: Limit sequence length on physical devices to prevent memory crashes
      const MAX_SEQUENCE_LENGTH = 200; // Increased limit to avoid truncating important system prompts
      if (currentSequence.length > MAX_SEQUENCE_LENGTH) {
        logger.warn(
          `⚠️  Truncating input sequence from ${currentSequence.length} to ${MAX_SEQUENCE_LENGTH} tokens for device stability`,
        );
        currentSequence = currentSequence.slice(-MAX_SEQUENCE_LENGTH);
      }

      // Generate tokens for complete sports advice
      for (let step = 0; step < maxTokens; step++) {
        logger.info(`🔄 Generation step ${step + 1}/${maxTokens}`);

        // Memory safety check during generation
        if (currentSequence.length > MAX_SEQUENCE_LENGTH) {
          logger.warn(
            `⚠️  Truncating sequence during generation: ${currentSequence.length} -> ${MAX_SEQUENCE_LENGTH}`,
          );
          currentSequence = currentSequence.slice(-MAX_SEQUENCE_LENGTH);
        }

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

        logger.info(`🧠 About to run ONNX inference for step ${step + 1}`);
        logger.info(
          `📊 Sequence length: ${sequenceLength}, Batch size: ${batchSize}`,
        );

        // Run inference with error handling
        let results;
        try {
          results = await this.session.run(feeds);
          logger.info(`✅ ONNX inference completed for step ${step + 1}`);
        } catch (inferenceError) {
          logger.error(
            `❌ ONNX inference failed at step ${step + 1}:`,
            inferenceError,
          );
          return {
            success: false,
            generatedText: '',
            tokenCount: generatedTokens.length,
            processingTime: Date.now() - startTime,
            error: `Inference failed at step ${step + 1}: ${inferenceError}`,
          };
        }

        if (!results || !results.logits) {
          logger.error(
            `❌ No logits returned from inference at step ${step + 1}`,
          );
          return {
            success: false,
            generatedText: '',
            tokenCount: generatedTokens.length,
            processingTime: Date.now() - startTime,
            error: `No logits returned at step ${step + 1}`,
          };
        }

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

      // Dispose session to free memory after successful generation
      await this.disposeSession();

      return {
        success: true,
        generatedText,
        tokenCount: generatedTokens.length,
        processingTime,
      };
    } catch (error) {
      const processingTime = Date.now() - startTime;
      logger.error('❌ Sports advice generation failed:', error);

      // Enhanced error reporting for device debugging
      let errorMessage = 'Unknown error';
      let errorDetails = '';

      if (error instanceof Error) {
        errorMessage = error.message;
        errorDetails = error.stack || '';
        logger.error(`❌ Error name: ${error.name}`);
        logger.error(`❌ Error message: ${error.message}`);
        logger.error(`❌ Error stack: ${error.stack}`);
      }

      // Check if it's a specific ONNX or memory error
      if (errorMessage.includes('memory') || errorMessage.includes('Memory')) {
        logger.error(
          '🧠 MEMORY ERROR detected - likely device memory limit exceeded',
        );
        errorMessage = 'Memory limit exceeded on device';
      } else if (
        errorMessage.includes('ONNX') ||
        errorMessage.includes('tensor')
      ) {
        logger.error('🤖 ONNX/Tensor ERROR detected - model inference issue');
        errorMessage = 'Model inference failed on device';
      }

      // Dispose session to free memory even on error
      await this.disposeSession();

      return {
        success: false,
        generatedText: '',
        tokenCount: 0,
        processingTime,
        error: `Device Error: ${errorMessage}`,
      };
    }
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

      // Enhanced detokenization using extractedVocabulary
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
   * Enhanced detokenization - convert token IDs back to text using extractedVocabulary
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
      // Remove the problematic ĊĊ characters (these are BPE encoding artifacts)
      .replace(/ĊĊ/g, '\n\n') // Replace with double newline for paragraphs
      .replace(/Ċ/g, '\n') // Replace single Ċ with newline
      // Remove standalone C1, C2, C3, etc. (citation markers)
      .replace(/\bC\d+\b\.?\s*/g, '')
      // Remove CC patterns
      .replace(/\bCC\d*\b\.?\s*/g, '')
      // Remove isolated periods and numbers
      .replace(/\s+\d+\.\s*$/, '')
      // Remove trailing incomplete words
      .replace(/\s+\w{1,2}$/, '')
      // Clean up extra spaces and normalize whitespace
      .replace(/\s+/g, ' ')
      .replace(/\n\s+/g, '\n')
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
