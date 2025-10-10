import { LlamaContext, initLlama } from 'llama.rn';  
import { logger } from '../utils/logger';

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

class LlamaTextGenerationService {
  private static instance: LlamaTextGenerationService;
  private context: LlamaContext | null = null;
  private isInitialized = false;
  private modelPath: string | null = null;

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
    try {
      logger.info('🦙 Initializing Llama Text Generation Service...');
      
      // Use provided path or default bundle path
      this.modelPath = modelPath || `${require('react-native-fs').MainBundlePath}/DeepSeek-R1-Distill-Qwen-1.5B-Q4_K_M.gguf`;
      
      logger.info(`📁 Model path: ${this.modelPath}`);
      logger.info('🔄 Creating Llama context...');

      // Create Llama context with optimized settings for mobile
      this.context = await initLlama({
        model: this.modelPath,
        n_ctx: 4096,        // Increased context window for longer conversations
        n_threads: 4,       // CPU threads (optimal for mobile)
        n_batch: 256,       // Increased batch size for better throughput
        use_mlock: false,   // Don't lock memory to RAM
        use_mmap: true,     // Use memory mapping for efficiency
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
          logger.error('📁 Model file not found - check if GGUF file is in bundle');
          logger.error('💡 Make sure to add .gguf file to Xcode project bundle');
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
    maxTokens: number = 150
  ): Promise<LlamaGenerationResult> {
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

    try {
      logger.info(`🏃‍♂️ Generating sports advice for: "${prompt.substring(0, 50)}..."`);

      // Create sports science system prompt
      const sportsPrompt = `<|im_start|>system
You are an expert sports scientist and HRV (Heart Rate Variability) specialist with deep knowledge of athletic performance, recovery, and training optimization. 

**Your expertise includes:**
- Heart Rate Variability analysis and interpretation
- Athletic recovery and adaptation patterns
- Training load management and periodization
- Sports physiology and exercise science
- Evidence-based performance optimization strategies

**Response guidelines:**
- Provide accurate, evidence-based information
- Use clear, accessible language while maintaining technical accuracy
- Include practical applications for athletes
- Reference HRV metrics and their meanings when relevant
- Always prioritize athlete safety and well-being

**Safety disclaimer requirement:**
Always conclude your response with a clear safety disclaimer that this advice is for informational purposes only and users should consult healthcare professionals for specific medical concerns.
<|im_end|>
<|im_start|>user
${prompt}
<|im_end|>
<|im_start|>assistant
`;

      // Generate response using Llama
      logger.info('🧠 Running Llama inference...');
      
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

      logger.info(`✅ Generated ${response.tokens_predicted} tokens in ${processingTime}ms`);

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
    }
  }

  /**
   * Generate text with custom configuration
   */
  async generateText(
    prompt: string,
    config: LlamaGenerationConfig
  ): Promise<LlamaGenerationResult> {
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
  getStatus(): { initialized: boolean; modelPath: string | null } {
    return {
      initialized: this.isInitialized,
      modelPath: this.modelPath,
    };
  }
}

// Export singleton instance
export const llamaTextGenerationService = LlamaTextGenerationService.getInstance();
export default LlamaTextGenerationService;