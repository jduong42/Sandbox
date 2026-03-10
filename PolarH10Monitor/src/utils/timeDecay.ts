/**
 * timeDecay.ts
 *
 * Exponential time-decay scoring for training sessions.
 *
 * score = e^(-λ × daysAgo)
 *
 * Default λ = 0.05  →  half-life ≈ 14 days
 *   (a session from 14 days ago scores ~0.5 relative to a session from today)
 *
 * Use topNByDecay to get the N most relevant sessions for a query when no
 * explicit date range is specified — they arrive back in chronological order
 * so they can be used directly in context block formatting.
 */

import { TrainingSession } from '../types/training';

export function scoreByTimeDecay(
  sessions: TrainingSession[],
  lambda = 0.05,
  now = new Date(),
): Array<TrainingSession & { decayScore: number }> {
  return sessions.map(s => {
    const daysElapsed =
      (now.getTime() - new Date(s.date).getTime()) / 86_400_000;
    return { ...s, decayScore: Math.exp(-lambda * daysElapsed) };
  });
}

/**
 * Returns the top N sessions ordered by decay score, then restored to
 * chronological order so the LLM reads them oldest→newest.
 */
export function topNByDecay(
  sessions: TrainingSession[],
  n: number,
  lambda = 0.05,
): TrainingSession[] {
  return scoreByTimeDecay(sessions, lambda)
    .sort((a, b) => b.decayScore - a.decayScore)
    .slice(0, n)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}
