import { useRecordingStore } from '../src/store/recordingStore';
import { HeartRateZone } from '../src/types/training';

const PHYSIOLOGY = {
  maxHeartRate: 190,
  restingHeartRate: 60,
  gender: 'male' as const,
};

describe('recordingStore', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(1_000_000);
    useRecordingStore.getState().reset();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('starts with no live data', () => {
    const state = useRecordingStore.getState();
    expect(state.currentHeartRate).toBeNull();
    expect(state.currentZone).toBeNull();
    expect(state.pmdActive).toBe(false);
    expect(state.sessionAvgHeartRate).toBeNull();
    expect(state.sessionPeakHeartRate).toBeNull();
    expect(state.currentTrimp).toBeNull();
  });

  it('recordHeartRate before startSession degrades gracefully (no crash)', () => {
    useRecordingStore.getState().recordHeartRate(140);
    expect(useRecordingStore.getState().currentHeartRate).toBe(140);
    expect(useRecordingStore.getState().sessionAvgHeartRate).toBeNull();
  });

  it('computes running avg/peak/TRIMP and zone across multiple readings', () => {
    useRecordingStore.getState().startSession(new Date(1_000_000), PHYSIOLOGY);

    useRecordingStore.getState().recordHeartRate(140); // 140/190=73.7% -> Zone 3
    let state = useRecordingStore.getState();
    expect(state.currentZone).toBe(HeartRateZone.ZONE_3);
    expect(state.sessionAvgHeartRate).toBe(140);
    expect(state.sessionPeakHeartRate).toBe(140);
    expect(state.currentTrimp).toBe(0); // zero elapsed time so far

    jest.setSystemTime(1_005_000); // +5s
    useRecordingStore.getState().recordHeartRate(150); // still Zone 3
    state = useRecordingStore.getState();
    expect(state.sessionAvgHeartRate).toBe(145); // round((140+150)/2)
    expect(state.sessionPeakHeartRate).toBe(150);
    expect(state.zoneDurations[HeartRateZone.ZONE_3]).toBeCloseTo(5, 5);
    expect(state.currentTrimp).toBeGreaterThan(0);

    jest.setSystemTime(1_010_000); // +5s more
    useRecordingStore.getState().recordHeartRate(180); // 180/190=94.7% -> Zone 5
    state = useRecordingStore.getState();
    expect(state.currentZone).toBe(HeartRateZone.ZONE_5);
    expect(state.sessionAvgHeartRate).toBe(157); // round((140+150+180)/3)
    expect(state.sessionPeakHeartRate).toBe(180);
    // The 5s between the 2nd and 3rd reading is attributed to Zone 3 (the
    // zone we were in until this new reading arrived), giving 10s total.
    expect(state.zoneDurations[HeartRateZone.ZONE_3]).toBeCloseTo(10, 5);
    expect(state.zoneDurations[HeartRateZone.ZONE_5]).toBe(0);
  });

  it('setPmdActive updates independently of HR state', () => {
    useRecordingStore.getState().setPmdActive(true);
    expect(useRecordingStore.getState().pmdActive).toBe(true);
    expect(useRecordingStore.getState().currentHeartRate).toBeNull();
  });

  it('defaults connectionState to connected, and setConnectionState updates it', () => {
    expect(useRecordingStore.getState().connectionState).toBe('connected');

    useRecordingStore.getState().setConnectionState('reconnecting');
    expect(useRecordingStore.getState().connectionState).toBe('reconnecting');

    useRecordingStore.getState().setConnectionState('connected');
    expect(useRecordingStore.getState().connectionState).toBe('connected');
  });

  it('reset clears all live state, including physiology and accumulators', () => {
    useRecordingStore.getState().startSession(new Date(1_000_000), PHYSIOLOGY);
    useRecordingStore.getState().recordHeartRate(150);
    useRecordingStore.getState().setPmdActive(true);
    useRecordingStore.getState().setConnectionState('reconnecting');

    useRecordingStore.getState().reset();

    const state = useRecordingStore.getState();
    expect(state.currentHeartRate).toBeNull();
    expect(state.currentZone).toBeNull();
    expect(state.pmdActive).toBe(false);
    expect(state.connectionState).toBe('connected');
    expect(state.sessionAvgHeartRate).toBeNull();
    expect(state.sessionPeakHeartRate).toBeNull();
    expect(state.currentTrimp).toBeNull();
    expect(state.zoneDurations[HeartRateZone.ZONE_3]).toBe(0);

    // A fresh recordHeartRate after reset (without startSession) should
    // degrade gracefully again, proving physiology/sessionStartTime were
    // actually cleared, not just the visible fields.
    useRecordingStore.getState().recordHeartRate(120);
    expect(useRecordingStore.getState().sessionAvgHeartRate).toBeNull();
  });
});
