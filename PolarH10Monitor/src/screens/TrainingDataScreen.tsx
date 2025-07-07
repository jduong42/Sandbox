import React, { useState } from 'react';
import {
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import NativeIcon from '../components/common/NativeIcon';
import { theme, trainingScreenStyles } from '../theme';
import { useBLEScanning, useSessionRecording } from '../hooks';

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
    <View style={trainingScreenStyles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={theme.colors.background}
      />

      <ScrollView style={trainingScreenStyles.scrollContent}>
        {/* Connection Status */}
        <View
          style={[
            trainingScreenStyles.connectionStatus,
            isConnected
              ? trainingScreenStyles.connectionStatusConnected
              : trainingScreenStyles.connectionStatusDisconnected,
          ]}
        >
          <NativeIcon
            name={isConnected ? 'bluetooth-connected' : 'bluetooth-disabled'}
            size={20}
            color={isConnected ? theme.colors.success : theme.colors.error}
          />
          <Text
            style={[
              trainingScreenStyles.connectionStatusText,
              isConnected
                ? trainingScreenStyles.connectionStatusTextConnected
                : trainingScreenStyles.connectionStatusTextDisconnected,
            ]}
          >
            {isConnected
              ? `Connected to ${connectedDeviceName || 'Device'}`
              : bluetoothEnabled
              ? 'Not connected to any device'
              : 'Bluetooth is disabled'}
          </Text>
        </View>

        {/* Active Recording Card */}
        {activeSession && isRecording && (
          <View style={trainingScreenStyles.activeRecordingCard}>
            <View style={trainingScreenStyles.activeRecordingHeader}>
              <View style={trainingScreenStyles.recordingIndicator} />
              <Text style={trainingScreenStyles.activeRecordingTitle}>
                Recording Active
              </Text>
            </View>

            <View style={trainingScreenStyles.recordingDetails}>
              <View style={trainingScreenStyles.recordingDetailRow}>
                <Text style={trainingScreenStyles.recordingDetailLabel}>
                  Session:
                </Text>
                <Text style={trainingScreenStyles.recordingDetailValue}>
                  {activeSession.name}
                </Text>
              </View>

              <View style={trainingScreenStyles.recordingDetailRow}>
                <Text style={trainingScreenStyles.recordingDetailLabel}>
                  Duration:
                </Text>
                <Text style={trainingScreenStyles.recordingDetailValue}>
                  {formatDuration(sessionDuration)}
                </Text>
              </View>

              <View style={trainingScreenStyles.recordingDetailRow}>
                <Text style={trainingScreenStyles.recordingDetailLabel}>
                  Device:
                </Text>
                <Text style={trainingScreenStyles.recordingDetailValue}>
                  {activeSession.deviceName}
                </Text>
              </View>

              <View style={trainingScreenStyles.recordingDetailRow}>
                <Text style={trainingScreenStyles.recordingDetailLabel}>
                  Started:
                </Text>
                <Text style={trainingScreenStyles.recordingDetailValue}>
                  {new Date(activeSession.startTime).toLocaleTimeString()}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={trainingScreenStyles.stopButton}
              onPress={stopRecording}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={theme.colors.surface} />
              ) : (
                <NativeIcon
                  name="stop"
                  size={20}
                  color={theme.colors.surface}
                />
              )}
              <Text style={trainingScreenStyles.stopButtonText}>
                {isLoading ? 'Stopping...' : 'Stop Recording'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                marginTop: theme.spacing.sm,
                padding: theme.spacing.sm,
                alignItems: 'center',
              }}
              onPress={clearActiveSession}
            >
              <Text
                style={{
                  fontSize: theme.typography.sizes.xs,
                  color: theme.colors.textSecondary,
                  textDecorationLine: 'underline',
                }}
              >
                Clear Session (Emergency)
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Start Recording Card */}
        {!isRecording && (
          <View style={trainingScreenStyles.recordingCard}>
            <View style={trainingScreenStyles.recordingCardHeader}>
              <NativeIcon
                name="fiber-manual-record"
                size={24}
                color={theme.colors.primary}
                style={trainingScreenStyles.recordingIcon}
              />
              <Text style={trainingScreenStyles.recordingTitle}>
                Start Recording Session
              </Text>
            </View>

            <Text style={trainingScreenStyles.recordingSubtitle}>
              Start a new recording session on your connected Polar H10 device.
              The device will record internally, allowing you to train freely.
            </Text>

            <View style={trainingScreenStyles.sessionInputContainer}>
              <Text style={trainingScreenStyles.sessionInputLabel}>
                Session Name
              </Text>
              <TextInput
                style={[
                  trainingScreenStyles.sessionInput,
                  isInputFocused && trainingScreenStyles.sessionInputFocused,
                ]}
                value={sessionName}
                onChangeText={setSessionName}
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => setIsInputFocused(false)}
                placeholder="e.g., Morning Run, Bike Training..."
                placeholderTextColor={theme.colors.textSecondary}
                maxLength={50}
                editable={!isLoading}
              />

              <TouchableOpacity
                style={{
                  marginTop: theme.spacing.xs,
                  alignSelf: 'flex-end',
                }}
                onPress={handleQuickStart}
                disabled={isLoading}
              >
                <Text
                  style={{
                    fontSize: theme.typography.sizes.sm,
                    color: theme.colors.primary,
                    textDecorationLine: 'underline',
                  }}
                >
                  Generate name
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[
                trainingScreenStyles.recordingButton,
                (!canStartRecording || isLoading) &&
                  trainingScreenStyles.recordingButtonDisabled,
              ]}
              onPress={handleStartRecording}
              disabled={!canStartRecording || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={theme.colors.surface} />
              ) : (
                <NativeIcon
                  name="fiber-manual-record"
                  size={20}
                  color={
                    canStartRecording
                      ? theme.colors.surface
                      : theme.colors.textSecondary
                  }
                />
              )}
              <Text
                style={[
                  trainingScreenStyles.recordingButtonText,
                  (!canStartRecording || isLoading) &&
                    trainingScreenStyles.recordingButtonTextDisabled,
                ]}
              >
                {isLoading ? 'Starting...' : 'Start Recording'}
              </Text>
            </TouchableOpacity>

            {!isConnected && (
              <Text
                style={{
                  fontSize: theme.typography.sizes.sm,
                  color: theme.colors.error,
                  textAlign: 'center',
                  marginTop: theme.spacing.sm,
                  fontStyle: 'italic',
                }}
              >
                Connect to your Polar H10 device to start recording
              </Text>
            )}
          </View>
        )}

        {/* Session History */}
        <View style={trainingScreenStyles.historyCard}>
          <View style={trainingScreenStyles.historyHeader}>
            <NativeIcon
              name="history"
              size={24}
              color={theme.colors.primary}
              style={trainingScreenStyles.recordingIcon}
            />
            <Text style={trainingScreenStyles.historyTitle}>
              Recent Sessions ({sessionHistory.length})
            </Text>
          </View>

          {sessionHistory.length === 0 ? (
            <Text style={trainingScreenStyles.historyEmpty}>
              No recording sessions yet. Start your first session above!
            </Text>
          ) : (
            sessionHistory.slice(0, 5).map((session, index) => (
              <View
                key={session.id}
                style={[
                  trainingScreenStyles.historyItem,
                  index === Math.min(4, sessionHistory.length - 1) &&
                    trainingScreenStyles.historyItemLast,
                ]}
              >
                <View style={trainingScreenStyles.historyItemLeft}>
                  <Text style={trainingScreenStyles.historyItemName}>
                    {session.name}
                  </Text>
                  <Text style={trainingScreenStyles.historyItemDate}>
                    {new Date(session.startTime).toLocaleDateString()} at{' '}
                    {new Date(session.startTime).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>
                <Text style={trainingScreenStyles.historyItemDuration}>
                  {session.duration
                    ? formatDuration(session.duration)
                    : 'In progress'}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default TrainingDataScreen;
