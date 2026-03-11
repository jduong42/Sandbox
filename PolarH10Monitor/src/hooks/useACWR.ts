import { useCallback, useEffect, useState } from 'react';
import { sessionRepository } from '../services/SessionRepository';
import { AnalyticsService } from '../services/AnalyticsService';
import { calculateACWR, DailyLoad, ACWRResult } from '../utils/ACWRCalculator';
import { usePhysiologyStore } from '../store/physiologyStore';
import type { TrainingSession } from '../types/training';

interface UseACWRReturn {
  /** ACWR result, null until data is loaded */
  result: ACWRResult | null;
  /**
   * Sessions enriched with TRIMP scores — use these for secondary
   * computations (e.g. streak) to avoid a second DB fetch.
   */
  enrichedSessions: TrainingSession[];
  /** Re-run the fetch + compute (call from useFocusEffect). */
  reload: () => void;
}

/**
 * Shared hook that fetches the last `sampleSize` sessions from SQLite,
 * enriches them with TRIMP using the current physiology profile, and
 * computes the ACWR.
 *
 * @param sampleSize - number of recent sessions to include (default 90)
 */
export function useACWR(sampleSize = 90): UseACWRReturn {
  const [result, setResult] = useState<ACWRResult | null>(null);
  const [enrichedSessions, setEnrichedSessions] = useState<TrainingSession[]>(
    [],
  );
  const physiology = usePhysiologyStore(s => s.settings);

  const load = useCallback(async () => {
    try {
      const all = await sessionRepository.getRecent(sampleSize);
      const age = physiology?.ageYears ?? 30;
      const profile = {
        id: 'acwr',
        age,
        restingHeartRate: physiology?.restingHeartRate ?? 60,
        maxHeartRate:
          physiology?.maxHeartRate != null
            ? physiology.maxHeartRate
            : 220 - age,
        sex: physiology?.sex,
      };
      const enriched = AnalyticsService.enrichSessionsWithTRIMP(all, profile);
      const dailyLoads: DailyLoad[] = enriched.map(s => ({
        date: s.date instanceof Date ? s.date : new Date(s.date ?? Date.now()),
        trimp: s.trimpScore ?? 0,
      }));
      setResult(calculateACWR(dailyLoads));
      setEnrichedSessions(enriched);
    } catch {
      // Keep previous state on error; components handle null gracefully.
    }
  }, [sampleSize, physiology]);

  useEffect(() => {
    load();
  }, [load]);

  return { result, enrichedSessions, reload: load };
}
