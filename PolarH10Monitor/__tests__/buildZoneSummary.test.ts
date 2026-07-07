import { buildZoneSummary } from '../src/services/TRIMPCalculator';
import { HeartRateZone } from '../src/types/training';

describe('buildZoneSummary', () => {
  it('returns all 5 zones with zero time when given no points', () => {
    const result = buildZoneSummary([]);
    expect(result).toHaveLength(5);
    expect(result.every(z => z.timeInZone === 0 && z.percentage === 0)).toBe(
      true,
    );
  });

  it('buckets time and computes percentage/avg/max HR per zone', () => {
    const result = buildZoneSummary([
      { heartRate: 100, zone: HeartRateZone.ZONE_1, durationSeconds: 60 },
      { heartRate: 110, zone: HeartRateZone.ZONE_1, durationSeconds: 60 },
      { heartRate: 160, zone: HeartRateZone.ZONE_4, durationSeconds: 30 },
    ]);

    const zone1 = result.find(z => z.zone === HeartRateZone.ZONE_1)!;
    expect(zone1.timeInZone).toBe(120);
    expect(zone1.averageHR).toBe(105); // round((100+110)/2)
    expect(zone1.maxHR).toBe(110);
    expect(zone1.percentage).toBeCloseTo((120 / 150) * 100, 5);

    const zone4 = result.find(z => z.zone === HeartRateZone.ZONE_4)!;
    expect(zone4.timeInZone).toBe(30);
    expect(zone4.averageHR).toBe(160);
    expect(zone4.percentage).toBeCloseTo((30 / 150) * 100, 5);

    const zone2 = result.find(z => z.zone === HeartRateZone.ZONE_2)!;
    expect(zone2.timeInZone).toBe(0);
    expect(zone2.averageHR).toBe(0);
    expect(zone2.maxHR).toBe(0);
  });

  it('handles irregular per-point durations correctly (not a fixed interval)', () => {
    const result = buildZoneSummary([
      { heartRate: 130, zone: HeartRateZone.ZONE_3, durationSeconds: 1.2 },
      { heartRate: 132, zone: HeartRateZone.ZONE_3, durationSeconds: 0.8 },
      { heartRate: 128, zone: HeartRateZone.ZONE_3, durationSeconds: 0 }, // last reading
    ]);
    const zone3 = result.find(z => z.zone === HeartRateZone.ZONE_3)!;
    expect(zone3.timeInZone).toBeCloseTo(2.0, 5);
    expect(zone3.percentage).toBeCloseTo(100, 5);
  });
});
