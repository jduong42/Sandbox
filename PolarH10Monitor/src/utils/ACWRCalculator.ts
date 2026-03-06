/**
 * ACWRCalculator.ts
 *
 * Acute:Chronic Workload Ratio — a standard physiotherapy / sports science
 * metric for estimating injury risk from training load spikes.
 *
 * ── Formula ──────────────────────────────────────────────────────────────────
 *   Acute Load  (ATL)  = sum of TRIMP for the last  7 days
 *   Chronic Load (CTL) = sum of TRIMP for the last 28 days ÷ 4
 *                        (normalised to a 7-day equivalent)
 *   ACWR = ATL / CTL
 *
 * ── Risk Zones ───────────────────────────────────────────────────────────────
 *   < 0.80  → Detraining / underloaded
 *   0.8–1.3 → Optimal zone ("sweet spot")
 *   1.3–1.5 → Moderate spike risk
 *   > 1.50  → High injury risk (Gabbett 2016)
 * ──────────────────────────────────────────────────────────────────────────────
 */

export type ACWRRisk =
  | 'detraining'
  | 'optimal'
  | 'moderate_risk'
  | 'high_risk'
  | 'insufficient_data';

export interface DailyLoad {
  /** Calendar date (time portion is ignored) */
  date: Date;
  /** TRIMP score for that day (0 if rest day) */
  trimp: number;
}

export interface ACWRResult {
  /** Acute training load — sum of last 7 days */
  acuteLoad: number;
  /** Chronic training load — 7-day normalised average of last 28 days */
  chronicLoad: number;
  /** Acute ÷ Chronic ratio (null if insufficient data) */
  acwr: number | null;
  /** Clinical risk label */
  risk: ACWRRisk;
  /** Human-readable interpretation */
  interpretation: string;
  /** Days of data used */
  daysOfData: number;
  /**
   * Monotony (Foster 2001) — mean 7-day load ÷ std dev of 7-day loads.
   * Low (<1): highly varied training. High (>2): same stimulus every day.
   */
  monotony: number;
  /**
   * Training Strain — acute load × monotony.
   * Combined weekly stress score; high strain + high ACWR = overreach risk.
   */
  strain: number;
}

/**
 * Given an array of daily TRIMP entries (sorted oldest→newest or any order),
 * calculate the ACWR relative to `referenceDate` (defaults to today).
 *
 * Entries more than 28 days before referenceDate are ignored.
 * Days with no entry are treated as rest days (TRIMP = 0).
 */
export function calculateACWR(
  dailyLoads: DailyLoad[],
  referenceDate: Date = new Date(),
): ACWRResult {
  const ref = startOfDay(referenceDate);

  // Build a map of day-offset → trimp for quick lookup (offset 0 = today)
  const trimpByOffset = new Map<number, number>();
  for (const entry of dailyLoads) {
    const offset = daysBetween(startOfDay(entry.date), ref);
    if (offset >= 0 && offset < 28) {
      // Sum if multiple sessions on same day
      trimpByOffset.set(offset, (trimpByOffset.get(offset) ?? 0) + entry.trimp);
    }
  }

  const daysOfData = trimpByOffset.size;

  // Acute load: sum over days 0–6 (last 7 days including today)
  let acuteLoad = 0;
  for (let d = 0; d < 7; d++) {
    acuteLoad += trimpByOffset.get(d) ?? 0;
  }

  // Chronic load: sum over days 0–27 divided by 4 → normalised 7-day avg
  let chronicSum = 0;
  for (let d = 0; d < 28; d++) {
    chronicSum += trimpByOffset.get(d) ?? 0;
  }
  const chronicLoad = Math.round((chronicSum / 4) * 10) / 10;

  // Monotony: mean / std-dev of 7 individual daily loads (Foster 2001)
  const daily7 = Array.from({ length: 7 }, (_, d) => trimpByOffset.get(d) ?? 0);
  const mean7 = daily7.reduce((s, v) => s + v, 0) / 7;
  const variance7 = daily7.reduce((s, v) => s + Math.pow(v - mean7, 2), 0) / 7;
  const stddev7 = Math.sqrt(variance7);
  // If stddev ≈ 0 but mean > 0: training is perfectly monotonous (cap at 10)
  // If both are 0: no training at all (monotony = 0)
  const monotony =
    stddev7 > 0.01
      ? Math.round((mean7 / stddev7) * 100) / 100
      : mean7 > 0
      ? 10
      : 0;
  const strain = Math.round(acuteLoad * monotony * 10) / 10;

  // Need at least 3 days to compute a meaningful ACWR
  if (daysOfData < 3) {
    return {
      acuteLoad: Math.round(acuteLoad),
      chronicLoad: Math.round(chronicLoad * 10) / 10,
      acwr: null,
      risk: 'insufficient_data',
      interpretation: 'Not enough training history yet (need ≥3 days).',
      daysOfData,
      monotony,
      strain,
    };
  }

  const acwr =
    chronicLoad > 0 ? Math.round((acuteLoad / chronicLoad) * 100) / 100 : null;

  const risk = classifyRisk(acwr);
  const interpretation = buildInterpretation(
    acwr,
    risk,
    acuteLoad,
    chronicLoad,
  );

  return {
    acuteLoad: Math.round(acuteLoad),
    chronicLoad: Math.round(chronicLoad * 10) / 10,
    acwr,
    risk,
    interpretation,
    daysOfData,
    monotony,
    strain,
  };
}

// ─── helpers ──────────────────────────────────────────────────────────────────

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** Returns how many days `earlier` is before `later` (always ≥ 0) */
function daysBetween(earlier: Date, later: Date): number {
  const ms = later.getTime() - earlier.getTime();
  return Math.floor(ms / 86_400_000);
}

function classifyRisk(acwr: number | null): ACWRRisk {
  if (acwr === null) return 'insufficient_data';
  if (acwr < 0.8) return 'detraining';
  if (acwr <= 1.3) return 'optimal';
  if (acwr <= 1.5) return 'moderate_risk';
  return 'high_risk';
}

function buildInterpretation(
  acwr: number | null,
  risk: ACWRRisk,
  acute: number,
  chronic: number,
): string {
  if (acwr === null) return 'Insufficient training data.';
  const ratio = acwr.toFixed(2);
  switch (risk) {
    case 'detraining':
      return `ACWR ${ratio} — training load is below your baseline. Consider increasing volume gradually to avoid detraining.`;
    case 'optimal':
      return `ACWR ${ratio} — load is in the optimal zone. Current acute (${Math.round(
        acute,
      )}) vs chronic (${chronic}) workload balance supports adaptation with low injury risk.`;
    case 'moderate_risk':
      return `ACWR ${ratio} — moderate spike detected. Acute load (${Math.round(
        acute,
      )}) is outpacing your chronic baseline (${chronic}). Consider an easier session today.`;
    case 'high_risk':
      return `ACWR ${ratio} — significant training spike. Acute load (${Math.round(
        acute,
      )}) is well above chronic baseline (${chronic}). High injury risk — a rest or recovery day is strongly recommended.`;
    default:
      return '';
  }
}
