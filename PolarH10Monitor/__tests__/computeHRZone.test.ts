import { computeHRZone } from '../src/services/TRIMPCalculator';
import { HeartRateZone } from '../src/types/training';

describe('computeHRZone', () => {
  const maxHR = 190;

  it('classifies below 60% of max as Zone 1', () => {
    expect(computeHRZone(100, maxHR)).toBe(HeartRateZone.ZONE_1); // 52.6%
  });

  it('classifies 60-70% of max as Zone 2', () => {
    expect(computeHRZone(120, maxHR)).toBe(HeartRateZone.ZONE_2); // 63.2%
  });

  it('classifies 70-80% of max as Zone 3', () => {
    expect(computeHRZone(140, maxHR)).toBe(HeartRateZone.ZONE_3); // 73.7%
  });

  it('classifies 80-90% of max as Zone 4', () => {
    expect(computeHRZone(160, maxHR)).toBe(HeartRateZone.ZONE_4); // 84.2%
  });

  it('classifies 90%+ of max as Zone 5', () => {
    expect(computeHRZone(180, maxHR)).toBe(HeartRateZone.ZONE_5); // 94.7%
  });

  it('is consistent exactly at zone boundaries', () => {
    expect(computeHRZone(maxHR * 0.6, maxHR)).toBe(HeartRateZone.ZONE_2);
    expect(computeHRZone(maxHR * 0.7, maxHR)).toBe(HeartRateZone.ZONE_3);
    expect(computeHRZone(maxHR * 0.8, maxHR)).toBe(HeartRateZone.ZONE_4);
    expect(computeHRZone(maxHR * 0.9, maxHR)).toBe(HeartRateZone.ZONE_5);
  });
});
