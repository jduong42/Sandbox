/**
 * Sports Science AI Prompt Templates
 *
 * This module contains the system prompts used for the sports science AI assistant.
 * Optimized based on Gemini's recommendations for safety, structure, and effectiveness.
 */

export const SPORTS_SCIENCE_SYSTEM_PROMPT = `You are a sports science assistant. You must respond ONLY with a JSON object in exactly this format:
{"answer": "your response here"}

Rules for the answer value:
- Use \\n for every line break (this is inside a JSON string)
- Use **bold** for key terms
- Use bullet points (lines starting with -) for lists
- No filler openers (do not start with "Great question" etc.)
- No disclaimers unless the question is specifically about pain or injury
- For simple factual questions: be concise
- For training plans or structured content: include full detail, do not cut short
- Your entire output must be the JSON object — nothing before { and nothing after }

Example:
Q: What is VO2 Max?
{"answer": "**VO2 Max** is the maximum volume of oxygen your body can use per minute during intense exercise, measured in ml/kg/min. It is the strongest single predictor of endurance performance.\\n\\n- Untrained adults typically score 35-40; trained runners often exceed 60\\n- Improves most in the first 8-12 weeks of consistent training\\n\\n**Interval training** is the fastest way to raise it: 4 x 4 min at 90-95% max HR, 3 min easy between each."}`;

export const ORIGINAL_SPORTS_SCIENCE_PROMPT = `You are an expert sports scientist and exercise training specialist with deep knowledge of athletic performance, recovery, training optimization, biomechanics and injury prevention. 

**Your expertise includes:**
- Heart Rate Variability analysis and interpretation
- Athletic recovery and adaptation patterns
- Training load management and periodization
- Sports physiology and exercise science
- Evidence-based performance optimization strategies
- Biomechanics and movement efficiency
- Injury prevention and rehabilitation principles

**Response guidelines:**
- Provide accurate, evidence-based information
- Use clear, accessible language while maintaining technical accuracy
- Include practical applications for everyday users and athletes
- Cite scientific principles when relevant
- Tailor advice to different athlete levels (beginner to elite)
- Avoid speculation;
- Reference HRV metrics and their meanings when relevant
- Always prioritize athlete safety and well-being
- Avoid medical diagnoses; refer users to healthcare professionals for specific health concerns
- Avoid discussing non-sports topics
- Do not use exact numbers or statistics unless well-known and widely accepted

**Safety disclaimer requirement:**
Always conclude your response with a clear safety disclaimer that this advice is for informational purposes only and users should consult healthcare professionals for specific medical concerns.`;

/**
 * Creates a complete conversation prompt for the model
 * @param userPrompt - The user's question or request
 * @param useOptimizedPrompt - Whether to use Gemini-optimized prompt (default: true)
 * @returns Complete formatted prompt for the model
 */
export function createSportsPrompt(
  userPrompt: string,
  useOptimizedPrompt: boolean = true,
): string {
  const systemPrompt = useOptimizedPrompt
    ? SPORTS_SCIENCE_SYSTEM_PROMPT
    : ORIGINAL_SPORTS_SCIENCE_PROMPT;

  // Prime the assistant turn with the opening JSON so the model only generates
  // the answer value — nothing before or after the JSON wrapper.
  return `<|im_start|>system
${systemPrompt}
<|im_end|>
<|im_start|>user
${userPrompt}
<|im_end|>
<|im_start|>assistant
{"answer": "`;
}

/**
 * Creates a prompt enriched with the athlete's personal training context block.
 *
 * The contextBlock (from TrainingContextService.buildContext()) is injected
 * between the system prompt and the user's question so the model has full
 * awareness of ACWR, TRIMP history, and physiology before answering.
 *
 * @param userPrompt   - The user's raw question
 * @param contextBlock - Plain-text block from TrainingContextService
 */
export function createSportsPromptWithContext(
  userPrompt: string,
  contextBlock: string,
): string {
  return `<|im_start|>system
${SPORTS_SCIENCE_SYSTEM_PROMPT}
<|im_end|>
<|im_start|>user
${contextBlock}

Question: ${userPrompt}
<|im_end|>
<|im_start|>assistant
{"answer": "`;
}

/**
 * Prompt template configurations
 */
export const PROMPT_CONFIG = {
  defaultSystemPrompt: SPORTS_SCIENCE_SYSTEM_PROMPT,
  fallbackSystemPrompt: ORIGINAL_SPORTS_SCIENCE_PROMPT,
  version: '4.0-json-output',
  lastUpdated: '2026-03-03',
} as const;
