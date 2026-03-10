/**
 * QueryParser.ts
 *
 * Parses a natural-language coaching question into structured filters so
 * TrainingContextService can inject only the most relevant sessions rather
 * than a fixed "last 28 days" window.
 *
 * Extracts:
 *  • dateRange  — explicit time reference ("this week", "last month", etc.)
 *  • sessionTypes — training type keywords ("interval", "tempo run", etc.)
 *  • intent     — 'summary' (period overview) | 'general' (advice / open Q)
 */

import { TrainingType } from '../types/training';

// ─── Public interface ─────────────────────────────────────────────────────────

export interface ParsedQuery {
  /** Explicit date range from the query; null → fall back to time-decay */
  dateRange: { from: Date; to: Date } | null;
  /** Session types to filter to; null → all types */
  sessionTypes: TrainingType[] | null;
  /** summary = user wants a period overview; general = advice / open question */
  intent: 'summary' | 'general';
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function startOfDay(d: Date): Date {
  const out = new Date(d);
  out.setHours(0, 0, 0, 0);
  return out;
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return startOfDay(d);
}

/** Returns the Monday of the week containing `date` (ISO week start). */
function startOfWeek(date = new Date()): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sunday
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return startOfDay(d);
}

// ─── Main parser ──────────────────────────────────────────────────────────────

export function parseQuery(query: string): ParsedQuery {
  const q = query.toLowerCase();
  const now = new Date();

  let dateRange: ParsedQuery['dateRange'] = null;
  let intent: ParsedQuery['intent'] = 'general';

  // ── Date range detection (order matters: most-specific first) ──

  if (/\bthis week\b/.test(q)) {
    dateRange = { from: startOfWeek(), to: now };
    intent = 'summary';
  } else if (/\blast week\b/.test(q)) {
    const thisWeekStart = startOfWeek();
    const lastWeekEnd = new Date(thisWeekStart);
    lastWeekEnd.setDate(lastWeekEnd.getDate() - 1);
    lastWeekEnd.setHours(23, 59, 59, 999);
    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    dateRange = { from: lastWeekStart, to: lastWeekEnd };
    intent = 'summary';
  } else if (/last (\d+) weeks?/.test(q)) {
    const n = parseInt(q.match(/last (\d+) weeks?/)![1], 10);
    dateRange = { from: daysAgo(n * 7), to: now };
    intent = 'summary';
  } else if (/\bthis month\b/.test(q)) {
    dateRange = {
      from: new Date(now.getFullYear(), now.getMonth(), 1),
      to: now,
    };
    intent = 'summary';
  } else if (/\blast month\b/.test(q)) {
    dateRange = {
      from: new Date(now.getFullYear(), now.getMonth() - 1, 1),
      to: new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59),
    };
    intent = 'summary';
  } else if (/last (\d+) months?/.test(q)) {
    const n = parseInt(q.match(/last (\d+) months?/)![1], 10);
    dateRange = { from: daysAgo(n * 30), to: now };
    intent = 'summary';
  } else if (/\byesterday\b/.test(q)) {
    const start = daysAgo(1);
    const end = new Date(start);
    end.setHours(23, 59, 59, 999);
    dateRange = { from: start, to: end };
  } else {
    // Named months: "in January", "last January", "in February 2025" etc.
    const MONTHS = [
      'january',
      'february',
      'march',
      'april',
      'may',
      'june',
      'july',
      'august',
      'september',
      'october',
      'november',
      'december',
    ];
    for (let i = 0; i < MONTHS.length; i++) {
      if (q.includes(MONTHS[i])) {
        // If the month is in the future relative to today, use the prior year
        const year =
          now.getMonth() < i ? now.getFullYear() - 1 : now.getFullYear();
        dateRange = {
          from: new Date(year, i, 1),
          to: new Date(year, i + 1, 0, 23, 59, 59),
        };
        intent = 'summary';
        break;
      }
    }
  }

  // ── Session type detection ──
  // More specific patterns first to avoid partial matches.
  const TYPE_MAP: Array<[RegExp, TrainingType]> = [
    [/\binterval(s| training)?\b/, TrainingType.INTERVAL_TRAINING],
    [/\btempo( run)?\b/, TrainingType.TEMPO_RUN],
    [/\blong (run|distance)\b/, TrainingType.LONG_DISTANCE],
    [/\brecovery( run)?\b/, TrainingType.RECOVERY_RUN],
    [/\bfartlek\b/, TrainingType.FARTLEK],
    [/\bjog(ging)?\b/, TrainingType.JOGGING],
    // Generic "run/running" only if no more specific type was matched
    [/\b(run|running)\b/, TrainingType.RUNNING],
  ];

  const foundTypes: TrainingType[] = [];
  for (const [pattern, type] of TYPE_MAP) {
    if (pattern.test(q) && !foundTypes.includes(type)) {
      foundTypes.push(type);
    }
  }

  return {
    dateRange,
    sessionTypes: foundTypes.length ? foundTypes : null,
    intent,
  };
}
