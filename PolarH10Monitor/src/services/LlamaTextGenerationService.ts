import { LlamaContext, initLlama } from 'llama.rn';
import { logger } from '../utils/logger';
import { createSportsPrompt, PROMPT_CONFIG } from './prompts/sportsPrompts';
import { responseLogger } from '../utils/ResponseLogger';
import { Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import RNFS from 'react-native-fs';

export interface LlamaGenerationResult {
  success: boolean;
  generatedText: string;
  tokenCount: number;
  processingTime: number;
  error?: string;
}

export interface LlamaGenerationConfig {
  maxTokens: number;
  temperature: number;
  stopTokens: string[];
}

export interface MemoryStats {
  totalMB: number;
  budgetMB: number;
  requiredMB: number;
}

class LlamaTextGenerationService {
  private static instance: LlamaTextGenerationService;
  private context: LlamaContext | null = null;
  private isInitialized = false;
  private isInferencing = false;
  private modelPath: string | null = null;
  public memoryStats: MemoryStats | null = null;

  private constructor() {}

  static getInstance(): LlamaTextGenerationService {
    if (!LlamaTextGenerationService.instance) {
      LlamaTextGenerationService.instance = new LlamaTextGenerationService();
    }
    return LlamaTextGenerationService.instance;
  }

  /**
   * Initialize the service with GGUF model
   */
  async initialize(modelPath?: string): Promise<boolean> {
    if (this.isInitialized && this.context) {
      return true;
    }

    try {
      logger.info('🦙 Initializing Llama Text Generation Service...');

      // Use provided path or default bundle path (fine-tuned model)
      // 👇 Update this filename to match your new model's .gguf filename
      const MODEL_FILENAME = 'model_q4km.gguf';
      this.modelPath =
        modelPath ||
        `${RNFS.MainBundlePath}/${MODEL_FILENAME}`;

      // Memory constraint check (crash prevention)
      // 60% of total device RAM budget rule
      try {
        const fileStat = await RNFS.stat(this.modelPath);
        const fileSizeMB = fileStat.size / (1024 * 1024);
        const requiredMemoryMB = fileSizeMB * 1.5; // File size x 1.5 for KV cache and activations
        
        const totalMemoryMB = await DeviceInfo.getTotalMemory() / (1024 * 1024);
        const memoryBudgetMB = totalMemoryMB * 0.6; // 60% of device RAM

        this.memoryStats = {
          totalMB: totalMemoryMB,
          budgetMB: memoryBudgetMB,
          requiredMB: requiredMemoryMB
        };

        logger.info(`🧠 Memory check - Total RAM: ${Math.round(totalMemoryMB)}MB, Budget: ${Math.round(memoryBudgetMB)}MB, Required: ${Math.round(requiredMemoryMB)}MB`);

        if (requiredMemoryMB > memoryBudgetMB) {
          logger.error('🧠 Memory budget exceeded! OS will likely kill the app. Initialization blocked.');
          throw new Error(`Device memory too low for local AI. Required ${Math.round(requiredMemoryMB)}MB, available budget ${Math.round(memoryBudgetMB)}MB.`);
        }
      } catch (e) {
        if (e instanceof Error && e.message.includes('Device memory too low')) {
          throw e; // Rethrow memory budget error
        }
        logger.warn('Could not perform memory size check prior to load (file might not exist yet).');
      }

      logger.info(`📁 Model path: ${this.modelPath}`);
      logger.info('🔄 Creating Llama context...');

      // Create Llama context with optimized settings for mobile
      this.context = await initLlama({
        model: this.modelPath,
        n_ctx: 2048, // sufficient for context block + answer; smaller KV cache = faster init
        n_threads: 6, // more CPU threads = faster prefill and decode
        n_batch: 512, // larger batch = faster prompt processing (lower TTFT)
        // Fallback to 0 GPU layers on Android to prevent flash_attention crashes, use Metal (-1) on iOS
        n_gpu_layers: Platform.OS === 'ios' ? -1 : 0, 
        use_mlock: false, // don't lock memory to RAM
        use_mmap: true, // use memory mapping for efficiency
      });

      if (!this.context) {
        throw new Error('Failed to create Llama context');
      }

      this.isInitialized = true;
      logger.info('✅ Llama Text Generation Service initialized successfully');
      return true;
    } catch (error) {
      logger.error('❌ Failed to initialize Llama service:', error);

      // Enhanced error reporting
      if (error instanceof Error) {
        if (error.message.includes('No such file')) {
          logger.error(
            '📁 Model file not found - check if GGUF file is in bundle',
          );
          logger.error(
            '💡 Make sure to add .gguf file to Xcode project bundle',
          );
        } else if (error.message.includes('memory')) {
          logger.error('🧠 Memory error - model might be too large for device');
        }
      }

      return false;
    }
  }

  /**
   * Generate sports science advice using Llama
   */
  async generateSportsAdvice(
    prompt: string,
    maxTokens: number = 150,
  ): Promise<LlamaGenerationResult> {
    if (this.isInferencing) {
      return {
        success: false,
        generatedText: '',
        tokenCount: 0,
        processingTime: 0,
        error: 'Model is currently busy',
      };
    }
    
    const startTime = Date.now();

    if (!this.isInitialized || !this.context) {
      return {
        success: false,
        generatedText: '',
        tokenCount: 0,
        processingTime: 0,
        error: 'Service not initialized',
      };
    }

    this.isInferencing = true;
    try {
      logger.info(
        `🏃‍♂️ Generating sports advice for: "${prompt.substring(0, 50)}..."`,
      );

      // Create sports science system prompt using Gemini-optimized version
      const sportsPrompt = createSportsPrompt(prompt, true);

      // Generate response using Llama
      logger.info('🧠 Running Llama inference...');
      logger.info(`📋 Using prompt version: ${PROMPT_CONFIG.version}`);

      // Log the full prompt for debugging
      console.log('🔍 PROMPT ENGINEERING DEBUG:');
      console.log(
        `📋 Prompt Version: ${PROMPT_CONFIG.version} (Updated: ${PROMPT_CONFIG.lastUpdated})`,
      );
      console.log('📝 Full Prompt Sent to Model:');
      console.log('─'.repeat(80));
      console.log(sportsPrompt);
      console.log('─'.repeat(80));

      const response = await this.context.completion({
        prompt: sportsPrompt,
        n_predict: maxTokens,
        stop: ['<|im_end|>', '</s>', '[INST]', '[/INST]'],
        temperature: 0.7,
        top_p: 0.9,
        top_k: 40,
        penalty_repeat: 1.1,
      });

      const processingTime = Date.now() - startTime;
      const generatedText = response.text.trim();

      // Log the response for debugging
      console.log('🤖 MODEL RESPONSE DEBUG:');
      console.log('📤 Raw Model Response:');
      console.log('─'.repeat(80));
      console.log(response.text);
      console.log('─'.repeat(80));
      console.log('📊 Response Stats:', {
        tokensGenerated: response.tokens_predicted,
        processingTimeMs: processingTime,
        responseLength: generatedText.length,
        promptLength: sportsPrompt.length,
      });

      logger.info(
        `✅ Generated ${response.tokens_predicted} tokens in ${processingTime}ms`,
      );

      return {
        success: true,
        generatedText,
        tokenCount: response.tokens_predicted || 0,
        processingTime,
      };
    } catch (error) {
      const processingTime = Date.now() - startTime;
      logger.error('❌ Llama generation failed:', error);

      return {
        success: false,
        generatedText: '',
        tokenCount: 0,
        processingTime,
        error: error instanceof Error ? error.message : 'Generation failed',
      };
    } finally {
      this.isInferencing = false;
    }
  }

  /**
   * Generate text with streaming — calls onToken for every token produced,
   * allowing the UI to update incrementally.
   */
  async generateTextStreaming(
    prompt: string,
    config: LlamaGenerationConfig,
    onToken: (token: string) => void,
    userQuery?: string,
  ): Promise<LlamaGenerationResult> {
    if (this.isInferencing) {
      return {
        success: false,
        generatedText: '',
        tokenCount: 0,
        processingTime: 0,
        error: 'Model is currently busy processing another request.',
      };
    }
    
    const startTime = Date.now();

    if (!this.isInitialized || !this.context) {
      return {
        success: false,
        generatedText: '',
        tokenCount: 0,
        processingTime: 0,
        error: 'Service not initialized',
      };
    }

    this.isInferencing = true;
    try {
      logger.info('🧠 Streaming text generation started...');

      const response = await this.context.completion(
        {
          prompt,
          n_predict: config.maxTokens,
          stop: config.stopTokens,
          temperature: config.temperature,
          top_p: 0.9,
          top_k: 40,
          penalty_repeat: 1.1,
        },
        (data: { token: string }) => {
          onToken(data.token);
        },
      );

      const processingTime = Date.now() - startTime;
      logger.info(
        `✅ Streamed ${response.tokens_predicted} tokens in ${processingTime}ms`,
      );

      // Log raw response for prompt engineering analysis
      responseLogger.log({
        ts: new Date().toISOString(),
        prompt,
        userQuery: userQuery ?? '',
        rawResponse: response.text,
        trimmed: response.text.trim(),
        tokens: response.tokens_predicted || 0,
        ms: processingTime,
      });

      return {
        success: true,
        generatedText: response.text.trim(),
        tokenCount: response.tokens_predicted || 0,
        processingTime,
      };
    } catch (error) {
      const processingTime = Date.now() - startTime;
      logger.error('❌ Llama streaming generation failed:', error);
      return {
        success: false,
        generatedText: '',
        tokenCount: 0,
        processingTime,
        error: error instanceof Error ? error.message : 'Generation failed',
      };
    } finally {
      this.isInferencing = false;
    }
  }

  /**
   * Generate text with custom configuration
   */
  async generateText(
    prompt: string,
    config: LlamaGenerationConfig,
  ): Promise<LlamaGenerationResult> {
    if (this.isInferencing) {
      return {
        success: false,
        generatedText: '',
        tokenCount: 0,
        processingTime: 0,
        error: 'Model is currently busy',
      };
    }
    const startTime = Date.now();

    if (!this.isInitialized || !this.context) {
      return {
        success: false,
        generatedText: '',
        tokenCount: 0,
        processingTime: 0,
        error: 'Service not initialized',
      };
    }

    this.isInferencing = true;
    try {
      logger.info(`🧠 Generating text with custom config...`);

      const response = await this.context.completion({
        prompt,
        n_predict: config.maxTokens,
        stop: config.stopTokens,
        temperature: config.temperature,
        top_p: 0.9,
        top_k: 40,
        penalty_repeat: 1.1,
      });

      const processingTime = Date.now() - startTime;

      return {
        success: true,
        generatedText: response.text.trim(),
        tokenCount: response.tokens_predicted || 0,
        processingTime,
      };
    } catch (error) {
      const processingTime = Date.now() - startTime;
      logger.error('❌ Llama text generation failed:', error);

      return {
        success: false,
        generatedText: '',
        tokenCount: 0,
        processingTime,
        error: error instanceof Error ? error.message : 'Generation failed',
      };
    } finally {
      this.isInferencing = false;
    }
  }

  /**
   * Release/dispose of the Llama context to free memory
   */
  async release(): Promise<void> {
    return this.dispose();
  }

  /**
   * Dispose of the Llama context to free memory
   */
  async dispose(): Promise<void> {
    try {
      if (this.context) {
        await this.context.release();
        this.context = null;
        this.isInitialized = false;
        logger.info('🗑️ Llama context disposed successfully');
      }
    } catch (error) {
      logger.warn('⚠️ Error disposing Llama context:', error);
    }
  }

  /**
   * Get initialization status
   */
  getStatus(): {
    initialized: boolean;
    modelPath: string | null;
    modelType: string;
    promptVersion: string;
  } {
    return {
      initialized: this.isInitialized,
      modelPath: this.modelPath,
      modelType: 'Fine-tuned Sports Science (LoRA)',
      promptVersion: PROMPT_CONFIG.version,
    };
  }
}

// Export singleton instance
export const llamaTextGenerationService =
  LlamaTextGenerationService.getInstance();
export default LlamaTextGenerationService;
