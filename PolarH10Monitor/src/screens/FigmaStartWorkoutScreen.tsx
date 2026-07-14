import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { BLEStatus } from '../components/figma/BLEStatus';
import { StartSessionButton } from '../components/figma/StartSessionButton';
import { LiveRecordingPanel } from '../components/figma/LiveRecordingPanel';
import {
  TrainingSessionCard,
  TrainingSession,
} from '../components/figma/TrainingSessionCard';
import { Toast } from '../components/common/Toast';
import { useToast } from '../hooks/useToast';
import { useTheme } from '../theme/ThemeContext';
import { sessionRepository } from '../services/SessionRepository';
import {
  sessionRecordingService,
  RecordingSession,
} from '../services/SessionRecordingService';
import { useFocusEffect } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import { useBLEScanning } from '../hooks/useBLEScanning';
import { useRecordingStore } from '../store/recordingStore';
import type { TrainingSession as StoredSession } from '../types/training';
import type { RootStackParamList } from '../navigation/NavigationTypes';
import { figmaStartWorkoutStyles as styles } from '../theme/figmaStartWorkoutScreen';

function formatType(type: string): string {
  return (type ?? 'Session')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, ch => ch.toUpperCase());
}

function formatRelativeDate(d: Date): string {
  const now = new Date();
  const diffDays = Math.floor(
    (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24),
  );
  const time = d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
  if (diffDays === 0) {
    return `Today, ${time}`;
  }
  if (diffDays === 1) {
    return `Yesterday, ${time}`;
  }
  return (
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
    `, ${time}`
  );
}

function toCardSession(s: StoredSession): TrainingSession {
  const d = new Date(s.startTime ?? s.date ?? Date.now());
  const mins = Math.round((s.duration ?? 0) / 60);
  return {
    id: s.id,
    name: s.title ?? formatType(s.type ?? ''),
    date: formatRelativeDate(d),
    duration: `${mins} min`,
    calories: Math.round(s.calories ?? 0),
    heartRate: Math.round(s.averageHeartRate ?? 0),
    trimpScore: s.trimpScore,
  };
}

export function FigmaStartWorkoutScreen() {
  const { c } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { isConnected, connectedDeviceName, batteryLevel } = useBLEScanning();
  const { toast, show: showToast, hide: hideToast } = useToast(4000);
  const [showAllSessions, setShowAllSessions] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [activeSession, setActiveSession] = useState<RecordingSession | null>(
    null,
  );
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const connectionState = useRecordingStore(s => s.connectionState);
  const previousConnectionState = useRef(connectionState);

  // Toast on connection-state transitions during an active recording only —
  // avoids firing on the default/initial value, and avoids firing at all
  // when there's no recording for it to be relevant to.
  useEffect(() => {
    const previous = previousConnectionState.current;
    if (isRecording && previous !== connectionState) {
      if (connectionState === 'reconnecting') {
        showToast('Heart rate monitor disconnected — reconnecting…', 'warning');
      } else if (connectionState === 'connected' && previous === 'reconnecting') {
        showToast('Reconnected to heart rate monitor', 'success');
      }
    }
    previousConnectionState.current = connectionState;
  }, [connectionState, isRecording, showToast]);

  const loadSessions = useCallback(async () => {
    try {
      const merged = await sessionRepository.getRecent(50);
      setSessions(merged.map(toCardSession));
    } catch (e) {
      console.warn('[WorkoutScreen] failed to load sessions', e);
    }
  }, []);

  // Reload sessions and recording state every time this screen comes into focus
  // (covers the case where user navigates back from StartSessionScreen)
  useFocusEffect(
    useCallback(() => {
      loadSessions();
      sessionRecordingService.getActiveSession().then(active => {
        setIsRecording(!!active);
        setActiveSession(active);
      });
    }, [loadSessions]),
  );

  const visibleSessions = showAllSessions ? sessions : sessions.slice(0, 3);
  const hasMoreSessions = sessions.length > 3;

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const handleStopSession = async () => {
    Alert.alert('Stop Recording', 'Save this session?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Stop & Save',
        style: 'destructive',
        onPress: async () => {
          try {
            await sessionRecordingService.stopRecording();
            setIsRecording(false);
            setActiveSession(null);
            await loadSessions();
            showToast('Session saved successfully', 'success');
          } catch (err) {
            const msg = err instanceof Error ? err.message : 'Unknown error';
            Alert.alert('Could not stop session', msg);
          }
        },
      },
    ]);
  };

  return (
    <LinearGradient colors={c.background} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={[styles.title, { color: c.foreground }]}>
                Start Workout
              </Text>
              <Text style={[styles.date, { color: c.muted }]}>{today}</Text>
            </View>
            <TouchableOpacity style={styles.avatar}>
              <Text style={styles.avatarText}>{user?.avatar ?? 'A'}</Text>
            </TouchableOpacity>
          </View>

          {/* BLE Status */}
          <View style={styles.section}>
            <BLEStatus
              isConnected={isConnected}
              deviceName={connectedDeviceName ?? 'No Device'}
              batteryLevel={batteryLevel ?? 0}
              onConnect={() => {
                /* navigate to Settings to pair */
              }}
            />
          </View>

          {/* Live recording panel — current BPM, zone, timer, signal status */}
          {isRecording && activeSession && (
            <View style={styles.section}>
              <LiveRecordingPanel startTime={activeSession.startTime} />
            </View>
          )}

          {/* Start Session Button */}
          <View style={styles.section}>
            <StartSessionButton
              isRecording={isRecording}
              onClick={
                isRecording
                  ? handleStopSession
                  : () => navigation.navigate('StartSession')
              }
            />
          </View>

          {/* Training Sessions */}
          <View style={styles.section}>
            <View style={styles.sessionsHeader}>
              <Text style={[styles.sectionTitle, { color: c.foreground }]}>
                Recent Sessions
              </Text>
              <Text style={[styles.sessionsCount, { color: c.muted }]}>
                {sessions.length} total
              </Text>
            </View>

            <View style={styles.sessionsList}>
              {sessions.length === 0 ? (
                <View style={[styles.emptyState, { borderColor: c.border }]}>
                  <Text style={[styles.emptyStateText, { color: c.muted }]}>
                    No sessions yet — record a workout or seed data in Dev
                    settings.
                  </Text>
                </View>
              ) : (
                visibleSessions.map(session => (
                  <TrainingSessionCard
                    key={session.id}
                    session={session}
                    onPress={() =>
                      navigation.navigate('SessionDetail', {
                        sessionId: String(session.id),
                      })
                    }
                  />
                ))
              )}
            </View>

            {hasMoreSessions && (
              <TouchableOpacity
                style={[
                  styles.showMoreButton,
                  { backgroundColor: c.surface, borderColor: c.border },
                ]}
                onPress={() => setShowAllSessions(!showAllSessions)}
                activeOpacity={0.7}
              >
                <Text style={[styles.showMoreText, { color: c.foreground }]}>
                  {showAllSessions
                    ? 'Show Less'
                    : `Show ${sessions.length - 3} More Sessions`}
                </Text>
                <Text style={[styles.chevron, { color: c.muted }]}>
                  {showAllSessions ? '▲' : '▼'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Toast notifications */}
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        duration={4000}
        onDismiss={hideToast}
      />
    </LinearGradient>
  );
}
