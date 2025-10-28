import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import NativeIcon from '../common/NativeIcon';
import { trainingDataStyles } from '../../theme/trainingDataStyles';
import { colors, spacing } from '../../theme';
import { typography } from '../../theme/typography';

interface ActiveSession {
  name: string;
  deviceName: string;
  startTime: Date;
}

interface ActiveRecordingCardProps {
  activeSession: ActiveSession;
  sessionDuration: number;
  isLoading: boolean;
  formatDuration: (duration: number) => string;
  onStopRecording: () => void;
  onClearActiveSession: () => void;
}

export const ActiveRecordingCard: React.FC<ActiveRecordingCardProps> = ({
  activeSession,
  sessionDuration,
  isLoading,
  formatDuration,
  onStopRecording,
  onClearActiveSession,
}) => {
  return (
    <View style={trainingDataStyles.activeRecordingCard}>
      <View style={trainingDataStyles.activeRecordingHeader}>
        <View style={trainingDataStyles.recordingIndicator} />
        <Text style={trainingDataStyles.activeRecordingTitle}>
          Recording Active
        </Text>
      </View>

      <View style={trainingDataStyles.recordingDetails}>
        <View style={trainingDataStyles.recordingDetailRow}>
          <Text style={trainingDataStyles.recordingDetailLabel}>Session:</Text>
          <Text style={trainingDataStyles.recordingDetailValue}>
            {activeSession.name}
          </Text>
        </View>

        <View style={trainingDataStyles.recordingDetailRow}>
          <Text style={trainingDataStyles.recordingDetailLabel}>Duration:</Text>
          <Text style={trainingDataStyles.recordingDetailValue}>
            {formatDuration(sessionDuration)}
          </Text>
        </View>

        <View style={trainingDataStyles.recordingDetailRow}>
          <Text style={trainingDataStyles.recordingDetailLabel}>Device:</Text>
          <Text style={trainingDataStyles.recordingDetailValue}>
            {activeSession.deviceName}
          </Text>
        </View>

        <View style={trainingDataStyles.recordingDetailRow}>
          <Text style={trainingDataStyles.recordingDetailLabel}>Started:</Text>
          <Text style={trainingDataStyles.recordingDetailValue}>
            {activeSession.startTime.toLocaleTimeString()}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={trainingDataStyles.stopButton}
        onPress={onStopRecording}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={colors.surface} />
        ) : (
          <NativeIcon name="stop" size={20} color={colors.surface} />
        )}
        <Text style={trainingDataStyles.stopButtonText}>
          {isLoading ? 'Stopping...' : 'Stop Recording'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={trainingDataStyles.emergencyButton}
        onPress={onClearActiveSession}
      >
        <Text style={trainingDataStyles.emergencyButtonText}>
          Clear Session (Emergency)
        </Text>
      </TouchableOpacity>
    </View>
  );
};
