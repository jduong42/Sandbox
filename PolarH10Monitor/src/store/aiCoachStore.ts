import { create } from 'zustand';
import { Message } from '../components/figma/ChatMessage';
import { llamaTextGenerationService } from '../services/LlamaTextGenerationService';
import { trainingContextService } from '../services/TrainingContextService';
import { createSportsPromptWithContext } from '../services/prompts/sportsPrompts';

export const INITIAL_MESSAGE: Message = {
  id: 0,
  role: 'assistant',
  content:
    "Hi! I'm your local AI fitness assistant. How can I help you with your fitness journey today?",
};

const parseJsonResponse = (raw: string): string => {
  const stripped = raw.replace(/"\s*\}\s*$/, '').trim();
  try {
    return JSON.parse(`"${stripped}"`);
  } catch {
    return stripped
      .replace(/\\n/g, '\n')
      .replace(/\\t/g, '\t')
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, '\\');
  }
};

let nextId = 1;

interface AICoachState {
  messages: Message[];
  isGenerating: boolean;
  isModelReady: boolean;
  initError: string | null;
  memoryStats: { totalMB: number; budgetMB: number; requiredMB: number } | null;
  morningHuddle: string | null;
  isGeneratingHuddle: boolean;
  setIsModelReady: (isReady: boolean) => void;
  setInitError: (error: string | null) => void;
  clearState: () => void;
  sendMessage: (text: string) => Promise<void>;
  generateMorningHuddle: () => Promise<void>;
  stopGeneration: () => Promise<void>;
  initializeModel: () => Promise<void>;
}

export const useAICoachStore = create<AICoachState>((set, get) => ({
  messages: [INITIAL_MESSAGE],
  isGenerating: false,
  isModelReady: false,
  initError: null,
  memoryStats: null,
  morningHuddle: null,
  isGeneratingHuddle: false,

  setIsModelReady: isModelReady => set({ isModelReady }),
  setInitError: initError => set({ initError }),

  clearState: () =>
    set({
      messages: [INITIAL_MESSAGE],
      isGenerating: false,
      initError: null,
      morningHuddle: null,
      isGeneratingHuddle: false,
    }),

  generateMorningHuddle: async () => {
    const { isModelReady, isGeneratingHuddle } = get();
    if (!isModelReady || isGeneratingHuddle) return;

    set({ isGeneratingHuddle: true });

    try {
      const { contextBlock } =
        await trainingContextService.buildContextForQuery('morning huddle');

      const huddlePrompt = `<|im_start|>system
You are a concise sports AI coach. Your goal is to write exactly ONE enthusiastic, encouraging sentence as a morning huddle based on the user's recent training data. Don't use quotes. Address the user directly ("You").
<|im_end|>
<|im_start|>user
Context:
${contextBlock}

Give me my morning huddle.
<|im_end|>
<|im_start|>assistant
`;

      let generatedHuddle = '';
      let lastUpdate = Date.now();

      const result = await llamaTextGenerationService.generateTextStreaming(
        huddlePrompt,
        {
          maxTokens: 50,
          temperature: 0.6,
          stopTokens: ['<|im_end|>', '</s>'],
        },
        (token: string) => {
          generatedHuddle += token;
          const now = Date.now();
          if (now - lastUpdate > 100) {
            lastUpdate = now;
            set({ morningHuddle: generatedHuddle });
          }
        },
        'Give me my morning huddle.',
      );

      if (result.success) {
        set({ morningHuddle: result.generatedText });
      }
    } catch (err) {
      console.error('Error generating huddle:', err);
      // Fallback
      set({ morningHuddle: "Ready to conquer the day? Let's get to work!" });
    } finally {
      set({ isGeneratingHuddle: false });
    }
  },

  stopGeneration: async () => {
    if (!get().isGenerating) return;
    console.log('Stopping AI generation explicitly...');
    await llamaTextGenerationService.abortGeneration();
    set({ isGenerating: false });
  },

  initializeModel: async () => {
    try {
      const success = await llamaTextGenerationService.initialize();
      set({
        isModelReady: success,
        initError: success ? null : 'Model failed to load',
        memoryStats: llamaTextGenerationService.memoryStats,
      });
    } catch (err) {
      set({ isModelReady: false, initError: String(err) });
    }
  },

  sendMessage: async (text: string) => {
    const state = get();
    // Guard against concurrent generations either in chat or huddle
    if (!text || state.isGenerating || state.isGeneratingHuddle) {
      console.warn('Generation blocked: Model is currently busy.');
      return;
    }

    const userMsg: Message = {
      id: ++nextId,
      role: 'user',
      content: text,
    };

    const assistantId = ++nextId;
    const assistantPlaceholder: Message = {
      id: assistantId,
      role: 'assistant',
      content: '',
      isStreaming: true,
    };

    set({
      messages: [...state.messages, userMsg, assistantPlaceholder],
      isGenerating: true,
    });

    try {
      const { contextBlock } =
        await trainingContextService.buildContextForQuery(text);
      const prompt = createSportsPromptWithContext(text, contextBlock);

      let accumulatedRaw = '';
      let lastUpdate = Date.now();

      const result = await llamaTextGenerationService.generateTextStreaming(
        prompt,
        {
          maxTokens: 1024,
          temperature: 0.4,
          stopTokens: ['"}', '<|im_end|>', '</s>'],
        },
        (token: string) => {
          accumulatedRaw += token;

          const now = Date.now();
          if (now - lastUpdate > 60) {
            lastUpdate = now;
            const display = parseJsonResponse(accumulatedRaw);
            set(s => ({
              messages: s.messages.map(m =>
                m.id === assistantId
                  ? { ...m, content: display, isStreaming: true }
                  : m,
              ),
            }));
          }
        },
        text,
      );

      set(s => ({
        messages: s.messages.map(m =>
          m.id === assistantId
            ? {
                ...m,
                content: result.success
                  ? parseJsonResponse(result.generatedText)
                  : "I'm having trouble responding right now. Please try again.",
                isStreaming: false,
              }
            : m,
        ),
        isGenerating: false,
      }));
    } catch (err: any) {
      // Don't trigger RN RedBox for known user-facing errors
      if (err?.message?.includes('Model is currently busy')) {
        console.warn('Blocked concurrent message:', err.message);
      } else {
        console.error(err);
      }

      set(s => ({
        messages: s.messages.map(m =>
          m.id === assistantId
            ? {
                ...m,
                content:
                  "I'm having trouble responding right now. Please try again.",
                isStreaming: false,
              }
            : m,
        ),
        isGenerating: false,
      }));
    }
  },
}));
