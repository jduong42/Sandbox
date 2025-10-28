import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import NativeIcon from '../common/NativeIcon';
import { trainingDataStyles } from '../../theme/trainingDataStyles';
import { colors } from '../../theme/colors';

interface StartRecordingCardProps {
  sessionName: string;
  onSessionNameChange: (name: string) => void;
  isInputFocused: boolean;
  onInputFocus: () => void;
  onInputBlur: () => void;
  onQuickStart: () => void;
  onStartRecording: () => void;
  canStartRecording: boolean;
  isLoading: boolean;
  isConnected: boolean;
}

export const StartRecordingCard: React.FC<StartRecordingCardProps> = ({
  sessionName,
  onSessionNameChange,
  isInputFocused,
  onInputFocus,
  onInputBlur,
  onQuickStart,
  onStartRecording,
  canStartRecording,
  isLoading,
  isConnected,
}) => {
  return (
    <View style={trainingDataStyles.recordingCard}>
      <View style={trainingDataStyles.recordingCardHeader}>
        <NativeIcon
          name="fiber-manual-record"
          size={24}
          color={colors.primary}
          style={trainingDataStyles.recordingIcon}
        />
        <Text style={trainingDataStyles.recordingTitle}>
          Start Recording Session
        </Text>
      </View>

      <Text style={trainingDataStyles.recordingSubtitle}>
        Start a new recording session on your connected Polar H10 device. The
        device will record internally, allowing you to train freely.
      </Text>

      <View style={trainingDataStyles.sessionInputContainer}>
        <Text style={trainingDataStyles.sessionInputLabel}>Session Name</Text>
        <TextInput
          style={[
            trainingDataStyles.sessionInput,
            isInputFocused && trainingDataStyles.sessionInputFocused,
          ]}
          value={sessionName}
          onChangeText={onSessionNameChange}
          onFocus={onInputFocus}
          onBlur={onInputBlur}
          placeholder="e.g., Morning Run, Bike Training..."
          placeholderTextColor={colors.textSecondary}
          maxLength={50}
          editable={!isLoading}
        />

        <TouchableOpacity
          style={trainingDataStyles.quickStartButton}
          onPress={onQuickStart}
          disabled={isLoading}
        >
          <Text style={trainingDataStyles.quickStartButtonText}>
            Generate name
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[
          trainingDataStyles.recordingButton,
          (!canStartRecording || isLoading) &&
            trainingDataStyles.recordingButtonDisabled,
        ]}
        onPress={onStartRecording}
        disabled={!canStartRecording || isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={colors.surface} />
        ) : (
          <NativeIcon
            name="fiber-manual-record"
            size={20}
            color={canStartRecording ? colors.surface : colors.textSecondary}
          />
        )}
        <Text
          style={[
            trainingDataStyles.recordingButtonText,
            (!canStartRecording || isLoading) &&
              trainingDataStyles.recordingButtonTextDisabled,
          ]}
        >
          {isLoading ? 'Starting...' : 'Start Recording'}
        </Text>
      </TouchableOpacity>

      {!isConnected && (
        <Text style={trainingDataStyles.errorText}>
          Connect to your Polar H10 device to start recording
        </Text>
      )}
    </View>
  );
};
