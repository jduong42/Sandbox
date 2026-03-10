import type { TrainingSession } from '../types/training';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Milestone {
  id: string;
  label: string;
  icon: string;
  description: string;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  totalSessions: number;
  lastSessionDate: Date | null;
  daysSinceLastSession: number | null;
  /** All milestones the user has reached so far */
  unlockedMilestones: Milestone[];
  /** The *most recently* unlocked milestone (for badge display) */
  latestMilestone: Milestone | null;
}

// ─── Milestone definitions ────────────────────────────────────────────────────

const SESSION_MILESTONES: Array<Milestone & { threshold: number }> = [
  {
    id: 'session_1',
    threshold: 1,
    label: 'First Step',
    icon: '🎯',
    description: 'Completed your first session',
  },
  {
    id: 'session_5',
    threshold: 5,
    label: 'Getting Started',
    icon: '⚡',
    description: '5 sessions completed',
  },
  {
    id: 'session_10',
    threshold: 10,
    label: 'Building Habits',
    icon: '🔥',
    description: '10 sessions completed',
  },
  {
    id: 'session_25',
    threshold: 25,
    label: 'Committed',
    icon: '💪',
    description: '25 sessions completed',
  },
  {
    id: 'session_50',
    threshold: 50,
    label: 'Dedicated',
    icon: '🏆',
    description: '50 sessions completed',
  },
  {
    id: 'session_100',
    threshold: 100,
    label: 'Century Club',
    icon: '🌟',
    description: '100 sessions completed',
  },
];

const STREAK_MILESTONES: Array<Milestone & { threshold: number }> = [
  {
    id: 'streak_3',
    threshold: 3,
    label: '3-Day Streak',
    icon: '✨',
    description: '3 training days in a row',
  },
  {
    id: 'streak_7',
    threshold: 7,
    label: 'Week Warrior',
    icon: '🗓️',
    description: 'Trained every day for a week',
  },
  {
    id: 'streak_14',
    threshold: 14,
    label: 'Fortnight',
    icon: '💥',
    description: '14-day training streak',
  },
  {
    id: 'streak_30',
    threshold: 30,
    label: 'Iron Routine',
    icon: '🔩',
    description: '30-day training streak',
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns a YYYY-MM-DD string so dates can be compared as strings */
function toDateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function diffDays(a: Date, b: Date): number {
  const msPerDay = 86_400_000;
  const ua = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const ub = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.floor((ub - ua) / msPerDay);
}

// ─── Main function ────────────────────────────────────────────────────────────

export function calculateStreak(sessions: TrainingSession[]): StreakData {
  if (sessions.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      totalSessions: sessions.length,
      lastSessionDate: null,
      daysSinceLastSession: null,
      unlockedMilestones: [],
      latestMilestone: null,
    };
  }

  // Build set of unique training days (YYYY-MM-DD), sorted ascending
  const daySet = new Set<string>();
  for (const s of sessions) {
    const d = new Date((s as any).date ?? (s as any).startTime ?? Date.now());
    daySet.add(toDateKey(d));
  }
  const sortedDays = Array.from(daySet).sort();

  // ── Current streak ──
  const today = toDateKey(new Date());
  const yesterday = toDateKey(new Date(Date.now() - 86_400_000));
  let currentStreak = 0;

  // Streak is alive if last day is today or yesterday
  const lastDay = sortedDays[sortedDays.length - 1];
  if (lastDay === today || lastDay === yesterday) {
    currentStreak = 1;
    // Walk backwards through consecutive days
    for (let i = sortedDays.length - 2; i >= 0; i--) {
      const prev = new Date(sortedDays[i + 1]);
      const curr = new Date(sortedDays[i]);
      if (diffDays(curr, prev) === 1) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  // ── Longest streak ──
  let longestStreak = 1;
  let runningStreak = 1;
  for (let i = 1; i < sortedDays.length; i++) {
    const prev = new Date(sortedDays[i - 1]);
    const curr = new Date(sortedDays[i]);
    if (diffDays(prev, curr) === 1) {
      runningStreak++;
      longestStreak = Math.max(longestStreak, runningStreak);
    } else {
      runningStreak = 1;
    }
  }
  longestStreak = Math.max(longestStreak, currentStreak);

  // ── Last session date ──
  const lastSessionDate = new Date(lastDay);
  const daysSinceLastSession = diffDays(lastSessionDate, new Date());

  // ── Unlocked milestones ──
  const totalSessions = sessions.length;
  const unlocked: Milestone[] = [];

  for (const m of SESSION_MILESTONES) {
    if (totalSessions >= m.threshold) {
      unlocked.push({ id: m.id, label: m.label, icon: m.icon, description: m.description });
    }
  }
  for (const m of STREAK_MILESTONES) {
    if (longestStreak >= m.threshold) {
      unlocked.push({ id: m.id, label: m.label, icon: m.icon, description: m.description });
    }
  }

  // Latest milestone = the highest threshold session milestone reached,
  // then highest streak milestone — so the "newest" achievement is shown.
  const latestSessionM = [...SESSION_MILESTONES]
    .reverse()
    .find(m => totalSessions >= m.threshold);
  const latestStreakM = [...STREAK_MILESTONES]
    .reverse()
    .find(m => longestStreak >= m.threshold);

  let latestMilestone: Milestone | null = null;
  if (latestSessionM && latestStreakM) {
    // Show whichever was most recently crossed
    latestMilestone =
      latestSessionM.threshold >= latestStreakM.threshold
        ? latestSessionM
        : latestStreakM;
  } else {
    latestMilestone = latestSessionM ?? latestStreakM ?? null;
  }

  return {
    currentStreak,
    longestStreak,
    totalSessions,
    lastSessionDate,
    daysSinceLastSession,
    unlockedMilestones: unlocked,
    latestMilestone,
  };
}
