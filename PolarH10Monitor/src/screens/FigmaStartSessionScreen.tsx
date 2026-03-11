import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { initialWindowMetrics } from 'react-native-safe-area-context';
import { figmaStartSessionStyles as styles } from '../theme/figmaStartSessionScreen';
import LinearGradient from 'react-native-linear-gradient';

// The tab navigator below this stack screen sets bottom=0 in the RNSC context,
// making SafeAreaView and useSafeAreaInsets() return 0 for bottom.
// initialWindowMetrics reads the raw hardware values before any navigation
// context can modify them — this is the correct fix for stack-over-tabs.
const TOP_INSET = initialWindowMetrics?.insets?.top ?? 44;
const BOTTOM_INSET = initialWindowMetrics?.insets?.bottom ?? 34;
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import NativeIcon from '../components/common/NativeIcon';
import { sessionRecordingService } from '../services/SessionRecordingService';
import { useBLEScanning } from '../hooks/useBLEScanning';
import { TrainingType } from '../types/training';
import type { RootStackParamList } from '../navigation/NavigationTypes';

type Nav = StackNavigationProp<RootStackParamList, 'StartSession'>;

const PRESETS: { label: string; type: TrainingType }[] = [
  { label: '🏃 Running', type: TrainingType.RUNNING },
  { label: '🚴 Cycling', type: TrainingType.CYCLING },
  { label: '❤️ HIIT', type: TrainingType.HIIT },
  { label: '🏋️ Strength', type: TrainingType.STRENGTH },
  { label: '🧘 Yoga', type: TrainingType.YOGA },
  { label: '🏊 Swimming', type: TrainingType.SWIMMING },
  { label: '🚶 Walking', type: TrainingType.WALKING },
  { label: '🏃 Jogging', type: TrainingType.JOGGING },
];

export function FigmaStartSessionScreen() {
  const navigation = useNavigation<Nav>();
  const { isConnected, connectedDeviceName } = useBLEScanning();
  const [sessionName, setSessionName] = useState('');
  const [selectedType, setSelectedType] = useState<TrainingType>(
    TrainingType.RUNNING,
  );

  const handlePresetSelect = (preset: {
    label: string;
    type: TrainingType;
  }) => {
    setSelectedType(preset.type);
    if (!sessionName.trim()) {
      setSessionName(preset.label.replace(/^\S+\s/, ''));
    }
  };

  const handleStart = async () => {
    if (!sessionName.trim()) return;
    try {
      await sessionRecordingService.startRecording(
        sessionName.trim(),
        selectedType,
        undefined,
        isConnected ? connectedDeviceName ?? undefined : undefined,
      );
      navigation.goBack();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      Alert.alert('Could not start session', msg);
    }
  };

  const canStart = sessionName.trim().length > 0;

  return (
    <View style={styles.root}>
      <View style={{ height: TOP_INSET }} />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          accessibilityLabel="Cancel"
          accessibilityRole="button"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <NativeIcon name="close" size={20} color="#e2e8f0" />
        </TouchableOpacity>
        <Text style={styles.title}>New Training Session</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: BOTTOM_INSET + 24 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        automaticallyAdjustKeyboardInsets
      >
        <Text style={styles.sectionLabel}>Activity Type</Text>
        <View style={styles.grid}>
          {PRESETS.map(preset => {
            const active = selectedType === preset.type;
            return (
              <TouchableOpacity
                key={preset.type}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => handlePresetSelect(preset)}
                activeOpacity={0.7}
              >
                <Text
                  style={[styles.chipText, active && styles.chipTextActive]}
                >
                  {preset.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={[styles.sectionLabel, { marginTop: 28 }]}>
          Session Name
        </Text>
        <TextInput
          style={styles.input}
          value={sessionName}
          onChangeText={setSessionName}
          placeholder="e.g., Morning Run"
          placeholderTextColor="#64748b"
          returnKeyType="done"
          onSubmitEditing={handleStart}
        />

        <TouchableOpacity
          onPress={handleStart}
          disabled={!canStart}
          activeOpacity={0.85}
          style={[
            styles.btnWrapper,
            { marginTop: 32, opacity: canStart ? 1 : 0.4 },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Start Recording"
        >
          <LinearGradient
            colors={['#a855f7', '#ec4899']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.btn}
          >
            <Text style={styles.btnText}>Start Recording</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
