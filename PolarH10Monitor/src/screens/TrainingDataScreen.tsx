import React, { useState } from 'react';
import { View, StatusBar, ScrollView } from 'react-native';
import { AnimatedTabView } from '../components';
import { trainingDataStyles } from '../theme/trainingDataStyles';
import { theme } from '../theme';
import { useBLEScanning, useSessionRecording } from '../hooks';
import {
  ConnectionStatusCard,
  ActiveRecordingCard,
  StartRecordingCard,
  SessionHistoryCard,
} from '../components/training';

const TrainingDataScreen: React.FC = () => {
  const [sessionName, setSessionName] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);

  const { isConnected, connectedDeviceName, bluetoothEnabled } =
    useBLEScanning();

  const {
    activeSession,
    sessionHistory,
    isLoading,
    sessionDuration,
    isRecording,
    startRecording,
    stopRecording,
    clearActiveSession,
    formatDuration,
    canStartRecording,
  } = useSessionRecording();

  const handleStartRecording = async () => {
    const success = await startRecording(sessionName);
    if (success) {
      setSessionName(''); // Clear input after successful start
    }
  };

  const generateSessionName = () => {
    const now = new Date();
    const time = now.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
    const date = now.toLocaleDateString();
    return `Training Session ${time} ${date}`;
  };

  const handleQuickStart = () => {
    const quickName = generateSessionName();
    setSessionName(quickName);
  };

  return (
    <AnimatedTabView>
      <View style={trainingDataStyles.container}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={theme.colors.background}
        />

        <ScrollView style={trainingDataStyles.scrollContent}>
          <ConnectionStatusCard
            isConnected={isConnected}
            connectedDeviceName={connectedDeviceName}
            bluetoothEnabled={bluetoothEnabled}
          />

          {activeSession && isRecording && (
            <ActiveRecordingCard
              activeSession={activeSession}
              sessionDuration={sessionDuration}
              isLoading={isLoading}
              formatDuration={formatDuration}
              onStopRecording={stopRecording}
              onClearActiveSession={clearActiveSession}
            />
          )}

          {!isRecording && (
            <StartRecordingCard
              sessionName={sessionName}
              onSessionNameChange={setSessionName}
              isInputFocused={isInputFocused}
              onInputFocus={() => setIsInputFocused(true)}
              onInputBlur={() => setIsInputFocused(false)}
              onQuickStart={handleQuickStart}
              onStartRecording={handleStartRecording}
              canStartRecording={canStartRecording}
              isLoading={isLoading}
              isConnected={isConnected}
            />
          )}

          <SessionHistoryCard
            sessionHistory={sessionHistory}
            formatDuration={formatDuration}
          />
        </ScrollView>
      </View>
    </AnimatedTabView>
  );
};

export default TrainingDataScreen;
