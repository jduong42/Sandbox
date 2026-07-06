import { useRecordingStore } from '../src/store/recordingStore';
import { HeartRateZone } from '../src/types/training';

describe('recordingStore', () => {
  beforeEach(() => {
    useRecordingStore.getState().reset();
  });

  it('starts with no live data', () => {
    const state = useRecordingStore.getState();
    expect(state.currentHeartRate).toBeNull();
    expect(state.currentZone).toBeNull();
    expect(state.pmdActive).toBe(false);
  });

  it('recordHeartRate sets both the heart rate and its computed zone', () => {
    useRecordingStore.getState().recordHeartRate(140, 190); // 73.7% -> Zone 3

    const state = useRecordingStore.getState();
    expect(state.currentHeartRate).toBe(140);
    expect(state.currentZone).toBe(HeartRateZone.ZONE_3);
  });

  it('setPmdActive updates the pmdActive flag independently of HR state', () => {
    useRecordingStore.getState().setPmdActive(true);
    expect(useRecordingStore.getState().pmdActive).toBe(true);
    expect(useRecordingStore.getState().currentHeartRate).toBeNull();
  });

  it('reset clears all live state back to defaults', () => {
    useRecordingStore.getState().recordHeartRate(150, 190);
    useRecordingStore.getState().setPmdActive(true);

    useRecordingStore.getState().reset();

    const state = useRecordingStore.getState();
    expect(state.currentHeartRate).toBeNull();
    expect(state.currentZone).toBeNull();
    expect(state.pmdActive).toBe(false);
  });
});
