import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { sessionRecordingService, RecordingSession } from '../services';
import { useBLEScanning } from './useBLEScanning';
import { logger } from '../utils/logger';

export const useSessionRecording = () => {
  const [activeSession, setActiveSession] = useState<RecordingSession | null>(
    null,
  );
  const [sessionHistory, setSessionHistory] = useState<RecordingSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(0);

  const { isConnected, connectedDeviceName, discoveredDevices } =
    useBLEScanning();

  // Get the currently connected device (we'll assume it's the first discovered device if connected)
  const connectedDevice =
    isConnected && discoveredDevices.length > 0 ? discoveredDevices[0] : null;

  // Check for active session on mount
  useEffect(() => {
    checkForActiveSession();
    loadSessionHistory();
  }, []);

  // Update session duration every second when recording
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (activeSession && activeSession.status === 'recording') {
      interval = setInterval(() => {
        const duration =
          Date.now() - new Date(activeSession.startTime).getTime();
        setSessionDuration(duration);
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [activeSession]);

  const checkForActiveSession = useCallback(async () => {
    try {
      const session = await sessionRecordingService.getActiveSession();
      setActiveSession(session);

      if (session) {
        const duration = Date.now() - new Date(session.startTime).getTime();
        setSessionDuration(duration);
      }
    } catch (error) {
      logger.error('Failed to check for active session', { error });
    }
  }, []);

  const loadSessionHistory = useCallback(async () => {
    try {
      const history = await sessionRecordingService.getSessionHistory();
      setSessionHistory(history);
    } catch (error) {
      logger.error('Failed to load session history', { error });
    }
  }, []);

  const startRecording = useCallback(
    async (sessionName: string) => {
      if (!isConnected || !connectedDevice) {
        Alert.alert(
          'Device Not Connected',
          'Please connect to your Polar H10 device before starting a recording session.',
          [{ text: 'OK' }],
        );
        return false;
      }

      if (activeSession) {
        Alert.alert(
          'Session Already Active',
          'A recording session is already in progress. Please stop the current session before starting a new one.',
          [{ text: 'OK' }],
        );
        return false;
      }

      if (!sessionName.trim()) {
        Alert.alert(
          'Session Name Required',
          'Please enter a name for your recording session.',
          [{ text: 'OK' }],
        );
        return false;
      }

      setIsLoading(true);
      try {
        const session = await sessionRecordingService.startRecording(
          sessionName,
          connectedDevice.id,
          connectedDeviceName || connectedDevice.name,
        );

        setActiveSession(session);
        setSessionDuration(0);

        Alert.alert(
          'Recording Started',
          `Your session "${session.name}" is now recording. You can now go train and the device will record internally.`,
          [{ text: 'OK' }],
        );

        return true;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error occurred';
        Alert.alert(
          'Recording Failed',
          `Could not start recording session: ${errorMessage}`,
          [{ text: 'OK' }],
        );
        logger.error('Failed to start recording', { error, sessionName });
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [isConnected, connectedDevice, connectedDeviceName, activeSession],
  );

  const stopRecording = useCallback(async (): Promise<boolean> => {
    if (!activeSession) {
      Alert.alert(
        'No Active Session',
        'There is no recording session currently active.',
        [{ text: 'OK' }],
      );
      return false;
    }

    return new Promise(resolve => {
      Alert.alert(
        'Stop Recording',
        `Are you sure you want to stop the recording session "${activeSession.name}"?`,
        [
          { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
          {
            text: 'Stop Recording',
            style: 'destructive',
            onPress: async () => {
              setIsLoading(true);
              try {
                const completedSession =
                  await sessionRecordingService.stopRecording();
                setActiveSession(null);
                setSessionDuration(0);

                // Refresh session history
                await loadSessionHistory();

                Alert.alert(
                  'Recording Completed',
                  `Session "${
                    completedSession.name
                  }" has been completed and saved. Duration: ${sessionRecordingService.formatDuration(
                    completedSession.duration || 0,
                  )}`,
                  [{ text: 'OK' }],
                );

                resolve(true);
              } catch (error) {
                const errorMessage =
                  error instanceof Error
                    ? error.message
                    : 'Unknown error occurred';
                Alert.alert(
                  'Stop Recording Failed',
                  `Could not stop recording session: ${errorMessage}`,
                  [{ text: 'OK' }],
                );
                logger.error('Failed to stop recording', { error });
                resolve(false);
              } finally {
                setIsLoading(false);
              }
            },
          },
        ],
      );
    });
  }, [activeSession, loadSessionHistory]);

  const clearActiveSession = useCallback(async () => {
    Alert.alert(
      'Clear Active Session',
      'This will clear the current recording session. Any recorded data may be lost. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Session',
          style: 'destructive',
          onPress: async () => {
            try {
              await sessionRecordingService.clearActiveSession();
              setActiveSession(null);
              setSessionDuration(0);
              Alert.alert(
                'Session Cleared',
                'The active session has been cleared.',
              );
            } catch (error) {
              Alert.alert('Error', 'Could not clear the active session.');
              logger.error('Failed to clear active session', { error });
            }
          },
        },
      ],
    );
  }, []);

  const formatDuration = useCallback((milliseconds: number): string => {
    return sessionRecordingService.formatDuration(milliseconds);
  }, []);

  const refreshHistory = useCallback(async () => {
    await loadSessionHistory();
  }, [loadSessionHistory]);

  return {
    // State
    activeSession,
    sessionHistory,
    isLoading,
    sessionDuration,
    isRecording: activeSession?.status === 'recording',

    // Actions
    startRecording,
    stopRecording,
    clearActiveSession,
    refreshHistory,

    // Utilities
    formatDuration,

    // Connection status
    canStartRecording: isConnected && !activeSession,
  };
};
