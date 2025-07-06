import { renderHook, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { useSessionRecording } from '../src/hooks/useSessionRecording';
import { sessionRecordingService } from '../src/services/SessionRecordingService';
import { useBLEScanning } from '../src/hooks/useBLEScanning';

// Mock the dependencies
jest.mock('../src/services/SessionRecordingService');
jest.mock('../src/hooks/useBLEScanning');
jest.mock('react-native/Libraries/Alert/Alert');

const mockSessionRecordingService = sessionRecordingService as jest.Mocked<typeof sessionRecordingService>;
const mockUseBLEScanning = useBLEScanning as jest.MockedFunction<typeof useBLEScanning>;
const mockAlert = Alert as jest.Mocked<typeof Alert>;

describe('useSessionRecording', () => {
  const mockBLEState = {
    isConnected: true,
    connectedDeviceName: 'Polar H10',
    discoveredDevices: [{ id: 'device123', name: 'Polar H10' }],
    isScanning: false,
    bluetoothEnabled: true,
    startScan: jest.fn(),
    connectToDevice: jest.fn(),
    disconnectDevice: jest.fn(),
    clearDevices: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseBLEScanning.mockReturnValue(mockBLEState);
    mockSessionRecordingService.getActiveSession.mockResolvedValue(null);
    mockSessionRecordingService.getSessionHistory.mockResolvedValue([]);
    mockSessionRecordingService.formatDuration.mockImplementation((ms) => `${ms}ms`);
  });

  describe('initialization', () => {
    it('should load active session and history on mount', async () => {
      const { result } = renderHook(() => useSessionRecording());

      expect(mockSessionRecordingService.getActiveSession).toHaveBeenCalled();
      expect(mockSessionRecordingService.getSessionHistory).toHaveBeenCalled();
      expect(result.current.isRecording).toBe(false);
    });
  });

  describe('startRecording', () => {
    it('should start recording when connected and session name provided', async () => {
      const mockSession = {
        id: 'session_123',
        name: 'Test Session',
        startTime: new Date(),
        deviceId: 'device123',
        deviceName: 'Polar H10',
        status: 'recording' as const,
      };

      mockSessionRecordingService.startRecording.mockResolvedValue(mockSession);

      const { result } = renderHook(() => useSessionRecording());

      await act(async () => {
        const success = await result.current.startRecording('Test Session');
        expect(success).toBe(true);
      });

      expect(mockSessionRecordingService.startRecording).toHaveBeenCalledWith(
        'Test Session',
        'device123',
        'Polar H10'
      );
      expect(mockAlert.alert).toHaveBeenCalledWith(
        'Recording Started',
        expect.stringContaining('Test Session'),
        [{ text: 'OK' }]
      );
    });

    it('should show error when not connected', async () => {
      mockUseBLEScanning.mockReturnValue({
        ...mockBLEState,
        isConnected: false,
      });

      const { result } = renderHook(() => useSessionRecording());

      await act(async () => {
        const success = await result.current.startRecording('Test Session');
        expect(success).toBe(false);
      });

      expect(mockAlert.alert).toHaveBeenCalledWith(
        'Device Not Connected',
        expect.stringContaining('connect to your Polar H10'),
        [{ text: 'OK' }]
      );
    });

    it('should show error when session name is empty', async () => {
      const { result } = renderHook(() => useSessionRecording());

      await act(async () => {
        const success = await result.current.startRecording('   ');
        expect(success).toBe(false);
      });

      expect(mockAlert.alert).toHaveBeenCalledWith(
        'Session Name Required',
        'Please enter a name for your recording session.',
        [{ text: 'OK' }]
      );
    });

    it('should handle service errors gracefully', async () => {
      mockSessionRecordingService.startRecording.mockRejectedValue(
        new Error('Service error')
      );

      const { result } = renderHook(() => useSessionRecording());

      await act(async () => {
        const success = await result.current.startRecording('Test Session');
        expect(success).toBe(false);
      });

      expect(mockAlert.alert).toHaveBeenCalledWith(
        'Recording Failed',
        expect.stringContaining('Service error'),
        [{ text: 'OK' }]
      );
    });
  });

  describe('stopRecording', () => {
    const mockActiveSession = {
      id: 'session_123',
      name: 'Test Session',
      startTime: new Date(),
      deviceId: 'device123',
      deviceName: 'Polar H10',
      status: 'recording' as const,
    };

    beforeEach(() => {
      mockSessionRecordingService.getActiveSession.mockResolvedValue(mockActiveSession);
    });

    it('should stop recording with confirmation', async () => {
      const mockCompletedSession = {
        ...mockActiveSession,
        endTime: new Date(),
        status: 'completed' as const,
        duration: 60000,
      };

      mockSessionRecordingService.stopRecording.mockResolvedValue(mockCompletedSession);
      
      // Mock Alert.alert to automatically confirm
      mockAlert.alert.mockImplementation((title, message, buttons) => {
        const confirmButton = buttons?.find(b => b.text === 'Stop Recording');
        if (confirmButton?.onPress) {
          confirmButton.onPress();
        }
      });

      const { result } = renderHook(() => useSessionRecording());

      await act(async () => {
        const success = await result.current.stopRecording();
        expect(success).toBe(true);
      });

      expect(mockAlert.alert).toHaveBeenCalledWith(
        'Stop Recording',
        expect.stringContaining('Test Session'),
        expect.arrayContaining([
          { text: 'Cancel', style: 'cancel', onPress: expect.any(Function) },
          { text: 'Stop Recording', style: 'destructive', onPress: expect.any(Function) },
        ])
      );
    });

    it('should handle no active session', async () => {
      mockSessionRecordingService.getActiveSession.mockResolvedValue(null);

      const { result } = renderHook(() => useSessionRecording());

      await act(async () => {
        const success = await result.current.stopRecording();
        expect(success).toBe(false);
      });

      expect(mockAlert.alert).toHaveBeenCalledWith(
        'No Active Session',
        'There is no recording session currently active.',
        [{ text: 'OK' }]
      );
    });
  });

  describe('clearActiveSession', () => {
    it('should clear active session with confirmation', async () => {
      mockSessionRecordingService.clearActiveSession.mockResolvedValue();
      
      // Mock Alert.alert to automatically confirm
      mockAlert.alert.mockImplementation((title, message, buttons) => {
        const confirmButton = buttons?.find(b => b.text === 'Clear Session');
        if (confirmButton?.onPress) {
          confirmButton.onPress();
        }
      });

      const { result } = renderHook(() => useSessionRecording());

      await act(async () => {
        await result.current.clearActiveSession();
      });

      expect(mockSessionRecordingService.clearActiveSession).toHaveBeenCalled();
      expect(mockAlert.alert).toHaveBeenCalledWith(
        'Session Cleared',
        'The active session has been cleared.'
      );
    });
  });

  describe('computed values', () => {
    it('should calculate canStartRecording correctly', () => {
      // Connected with no active session
      const { result } = renderHook(() => useSessionRecording());
      expect(result.current.canStartRecording).toBe(true);

      // Not connected
      mockUseBLEScanning.mockReturnValue({
        ...mockBLEState,
        isConnected: false,
      });
      const { result: result2 } = renderHook(() => useSessionRecording());
      expect(result2.current.canStartRecording).toBe(false);
    });

    it('should determine isRecording status correctly', async () => {
      const mockActiveSession = {
        id: 'session_123',
        name: 'Test Session',
        startTime: new Date(),
        deviceId: 'device123',
        deviceName: 'Polar H10',
        status: 'recording' as const,
      };

      mockSessionRecordingService.getActiveSession.mockResolvedValue(mockActiveSession);

      const { result } = renderHook(() => useSessionRecording());

      // Wait for the effect to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.isRecording).toBe(true);
    });
  });
});
