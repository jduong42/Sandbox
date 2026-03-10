import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { BLEStatus } from '../components/figma/BLEStatus';
import { StartSessionButton } from '../components/figma/StartSessionButton';
import {
  TrainingSessionCard,
  TrainingSession,
} from '../components/figma/TrainingSessionCard';
import { StartSessionModal } from '../components/figma/StartSessionModal';
import { useTheme } from '../theme/ThemeContext';
import { sessionRepository } from '../services/SessionRepository';
import { useFocusEffect } from '@react-navigation/native';
import type { TrainingSession as StoredSession } from '../types/training';

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
  const d = new Date((s as any).startTime ?? (s as any).date ?? Date.now());
  const mins = Math.round(((s as any).duration ?? 0) / 60);
  return {
    id: (s as any).id,
    name: (s as any).title ?? formatType((s as any).type ?? ''),
    date: formatRelativeDate(d),
    duration: `${mins} min`,
    calories: Math.round((s as any).calories ?? 0),
    heartRate: Math.round((s as any).averageHeartRate ?? 0),
    trimpScore: (s as any).trimpScore,
  };
}

export function FigmaStartWorkoutScreen() {
  const { c } = useTheme();
  const [isConnected, setIsConnected] = useState(true);
  const [deviceName] = useState('FitBand Pro');
  const [batteryLevel] = useState(78);
  const [showModal, setShowModal] = useState(false);
  const [showAllSessions, setShowAllSessions] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [sessions, setSessions] = useState<TrainingSession[]>([]);

  const loadSessions = useCallback(async () => {
    try {
      const merged = await sessionRepository.getRecent(50);
      setSessions(merged.map(toCardSession));
    } catch (e) {
      console.warn('[WorkoutScreen] failed to load sessions', e);
    }
  }, []);

  // useFocusEffect requires a sync callback — call the async fn without returning its Promise
  useFocusEffect(
    useCallback(() => {
      loadSessions();
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

  const handleStartSession = (sessionName: string) => {
    setIsRecording(true);
    setShowModal(false);
    console.log('Starting session:', sessionName);
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
              <Text style={styles.avatarText}>A</Text>
            </TouchableOpacity>
          </View>

          {/* BLE Status */}
          <View style={styles.section}>
            <BLEStatus
              isConnected={isConnected}
              deviceName={deviceName}
              batteryLevel={batteryLevel}
              onConnect={() => setIsConnected(!isConnected)}
            />
          </View>

          {/* Start Session Button */}
          <View style={styles.section}>
            <StartSessionButton
              isRecording={isRecording}
              onClick={() => setShowModal(true)}
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
                  <TrainingSessionCard key={session.id} session={session} />
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

      {/* Modal */}
      <StartSessionModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onStart={handleStartSession}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingTop: 24,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: '#cbd5e1',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#a855f7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sessionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  sessionsCount: {
    fontSize: 14,
    color: '#cbd5e1',
  },
  sessionsList: {
    gap: 12,
  },
  showMoreButton: {
    marginTop: 16,
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.5)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  showMoreText: {
    fontSize: 15,
    color: '#e2e8f0',
  },
  chevron: {
    fontSize: 12,
    color: '#e2e8f0',
  },
  emptyState: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
