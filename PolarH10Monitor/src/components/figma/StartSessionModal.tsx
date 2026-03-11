import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import NativeIcon from '../common/NativeIcon';
import { TrainingType } from '../../types/training';

interface StartSessionModalProps {
  visible: boolean;
  onClose: () => void;
  onStart: (sessionName: string, sessionType: TrainingType) => void;
}

interface WorkoutPreset {
  label: string;
  type: TrainingType;
}

const WORKOUT_PRESETS: WorkoutPreset[] = [
  { label: '🏃 Running', type: TrainingType.RUNNING },
  { label: '🚴 Cycling', type: TrainingType.CYCLING },
  { label: '❤️ HIIT', type: TrainingType.HIIT },
  { label: '🏋️ Strength', type: TrainingType.STRENGTH },
  { label: '🧘 Yoga', type: TrainingType.YOGA },
  { label: '🏊 Swimming', type: TrainingType.SWIMMING },
  { label: '🚶 Walking', type: TrainingType.WALKING },
  { label: '🏃 Jogging', type: TrainingType.JOGGING },
];

export function StartSessionModal({
  visible,
  onClose,
  onStart,
}: StartSessionModalProps) {
  const [sessionName, setSessionName] = useState('');
  const [selectedType, setSelectedType] = useState<TrainingType>(
    TrainingType.RUNNING,
  );

  const handleStart = () => {
    if (sessionName.trim()) {
      onStart(sessionName.trim(), selectedType);
      setSessionName('');
      setSelectedType(TrainingType.RUNNING);
    }
  };

  const handleClose = () => {
    setSessionName('');
    setSelectedType(TrainingType.RUNNING);
    onClose();
  };

  const handlePresetSelect = (preset: WorkoutPreset) => {
    setSelectedType(preset.type);
    if (!sessionName.trim()) {
      setSessionName(preset.label.replace(/^\S+\s/, ''));
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <SafeAreaProvider>
        <SafeAreaView style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>New Training Session</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
              accessibilityLabel="Close"
              accessibilityRole="button"
            >
              <NativeIcon name="close" size={20} color="#e2e8f0" />
            </TouchableOpacity>
          </View>

          {/* Scrollable content — button lives here so keyboard never covers it */}
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            automaticallyAdjustKeyboardInsets
          >
            {/* Activity type picker */}
            <Text style={styles.sectionLabel}>Activity Type</Text>
            <View style={styles.presetGrid}>
              {WORKOUT_PRESETS.map(preset => (
                <TouchableOpacity
                  key={preset.type}
                  style={[
                    styles.presetButton,
                    selectedType === preset.type && styles.presetButtonActive,
                  ]}
                  onPress={() => handlePresetSelect(preset)}
                  activeOpacity={0.7}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selectedType === preset.type }}
                >
                  <Text
                    style={[
                      styles.presetText,
                      selectedType === preset.type && styles.presetTextActive,
                    ]}
                  >
                    {preset.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Session name */}
            <Text style={[styles.sectionLabel, { marginTop: 28 }]}>
              Session Name
            </Text>
            <TextInput
              style={styles.input}
              value={sessionName}
              onChangeText={setSessionName}
              placeholder="e.g., Morning Run"
              placeholderTextColor="#94a3b8"
              returnKeyType="done"
              onSubmitEditing={handleStart}
            />
          </ScrollView>

          {/* Footer pinned outside ScrollView — SafeAreaView from react-native-safe-area-context
            (backed by SafeAreaProvider inside the Modal) correctly reads the modal's
            bottom inset and pads above the home indicator. */}
          <View style={styles.footer}>
            <TouchableOpacity
              onPress={handleStart}
              disabled={!sessionName.trim()}
              activeOpacity={0.8}
              style={styles.startWrapper}
              accessibilityRole="button"
              accessibilityLabel="Start Recording"
              accessibilityState={{ disabled: !sessionName.trim() }}
            >
              {sessionName.trim() ? (
                <LinearGradient
                  colors={['#a855f7', '#ec4899']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.startButton}
                >
                  <Text style={styles.startButtonText}>Start Recording</Text>
                </LinearGradient>
              ) : (
                <View style={[styles.startButton, styles.startButtonDisabled]}>
                  <Text style={styles.startButtonTextDisabled}>
                    Start Recording
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(51,65,85,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 32,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 14,
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  presetButton: {
    paddingHorizontal: 18,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    minHeight: 44,
    justifyContent: 'center',
  },
  presetButtonActive: {
    backgroundColor: '#7c3aed',
    borderColor: '#a855f7',
  },
  presetText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#94a3b8',
  },
  presetTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#ffffff',
    fontSize: 16,
    marginTop: 4,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
  },
  startWrapper: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  startButton: {
    paddingVertical: 17,
    alignItems: 'center',
    borderRadius: 14,
    minHeight: 56,
    justifyContent: 'center',
  },
  startButtonDisabled: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
  },
  startButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  startButtonTextDisabled: {
    color: '#475569',
    fontSize: 16,
    fontWeight: '600',
  },
});
