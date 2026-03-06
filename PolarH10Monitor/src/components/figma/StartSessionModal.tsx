import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import NativeIcon from '../common/NativeIcon';

interface StartSessionModalProps {
  visible: boolean;
  onClose: () => void;
  onStart: (sessionName: string) => void;
}

const PRESET_WORKOUTS = [
  'Yoga',
  'Pilates',
  'HIIT Training',
  'Strength Training',
  'Cardio',
  'Running',
  'Cycling',
  'Swimming',
];

export function StartSessionModal({
  visible,
  onClose,
  onStart,
}: StartSessionModalProps) {
  const [sessionName, setSessionName] = useState('');

  const handleStart = () => {
    if (sessionName.trim()) {
      onStart(sessionName.trim());
      setSessionName('');
    }
  };

  const handleClose = () => {
    setSessionName('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={styles.sheet}>
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.title}>New Training Session</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={handleClose}
                >
                  <NativeIcon name="close" size={20} color="#e2e8f0" />
                </TouchableOpacity>
              </View>

              {/* Content */}
              <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
              >
                {/* Text input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Training Name</Text>
                  <TextInput
                    style={styles.input}
                    value={sessionName}
                    onChangeText={setSessionName}
                    placeholder="e.g., Morning Yoga"
                    placeholderTextColor="#94a3b8"
                    returnKeyType="done"
                    onSubmitEditing={handleStart}
                    autoFocus
                  />
                </View>

                {/* Quick select */}
                <View style={styles.presetGroup}>
                  <Text style={styles.presetLabel}>Quick Select</Text>
                  <View style={styles.presetGrid}>
                    {PRESET_WORKOUTS.map(preset => (
                      <TouchableOpacity
                        key={preset}
                        style={[
                          styles.presetButton,
                          sessionName === preset && styles.presetButtonActive,
                        ]}
                        onPress={() => setSessionName(preset)}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.presetText,
                            sessionName === preset && styles.presetTextActive,
                          ]}
                        >
                          {preset}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </ScrollView>

              {/* Footer */}
              <View style={styles.footer}>
                <TouchableOpacity
                  onPress={handleStart}
                  disabled={!sessionName.trim()}
                  activeOpacity={0.8}
                  style={styles.startWrapper}
                >
                  {sessionName.trim() ? (
                    <LinearGradient
                      colors={['#a855f7', '#ec4899']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.startButton}
                    >
                      <Text style={styles.startButtonText}>
                        Start Recording
                      </Text>
                    </LinearGradient>
                  ) : (
                    <View
                      style={[styles.startButton, styles.startButtonDisabled]}
                    >
                      <Text style={styles.startButtonTextDisabled}>
                        Start Recording
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#1e293b',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(51, 65, 85, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 24,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#e2e8f0',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(51, 65, 85, 0.5)',
    borderWidth: 1,
    borderColor: '#475569',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#ffffff',
    fontSize: 16,
  },
  presetGroup: {
    marginBottom: 24,
  },
  presetLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#e2e8f0',
    marginBottom: 12,
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  presetButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(51, 65, 85, 0.5)',
    minHeight: 44,
    justifyContent: 'center',
  },
  presetButtonActive: {
    backgroundColor: '#a855f7',
  },
  presetText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#e2e8f0',
  },
  presetTextActive: {
    color: '#ffffff',
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  startWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  startButton: {
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 12,
    minHeight: 56,
    justifyContent: 'center',
  },
  startButtonDisabled: {
    backgroundColor: '#334155',
  },
  startButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  startButtonTextDisabled: {
    color: '#64748b',
    fontSize: 16,
    fontWeight: '600',
  },
});
