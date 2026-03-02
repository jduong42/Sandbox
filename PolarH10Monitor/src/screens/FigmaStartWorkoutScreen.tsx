import React, { useState } from 'react';
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

const ALL_SESSIONS: TrainingSession[] = [
  {
    id: 1,
    name: 'Morning Yoga',
    date: 'Today, 7:30 AM',
    duration: '45 min',
    calories: 180,
    heartRate: 95,
  },
  {
    id: 2,
    name: 'Pilates',
    date: 'Yesterday, 6:00 PM',
    duration: '50 min',
    calories: 220,
    heartRate: 105,
  },
  {
    id: 3,
    name: 'HIIT Training',
    date: 'Mar 1, 8:00 AM',
    duration: '30 min',
    calories: 285,
    heartRate: 145,
  },
  {
    id: 4,
    name: 'Yoga Flow',
    date: 'Feb 28, 7:00 AM',
    duration: '40 min',
    calories: 165,
    heartRate: 90,
  },
  {
    id: 5,
    name: 'Strength Training',
    date: 'Feb 27, 6:30 PM',
    duration: '55 min',
    calories: 310,
    heartRate: 120,
  },
  {
    id: 6,
    name: 'Meditation',
    date: 'Feb 27, 9:00 AM',
    duration: '20 min',
    calories: 45,
    heartRate: 70,
  },
  {
    id: 7,
    name: 'Core Workout',
    date: 'Feb 26, 7:15 AM',
    duration: '35 min',
    calories: 195,
    heartRate: 110,
  },
];

export function FigmaStartWorkoutScreen() {
  const { c } = useTheme();
  const [isConnected, setIsConnected] = useState(true);
  const [deviceName] = useState('FitBand Pro');
  const [batteryLevel] = useState(78);
  const [showModal, setShowModal] = useState(false);
  const [showAllSessions, setShowAllSessions] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const visibleSessions = showAllSessions
    ? ALL_SESSIONS
    : ALL_SESSIONS.slice(0, 3);
  const hasMoreSessions = ALL_SESSIONS.length > 3;

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
                {ALL_SESSIONS.length} total
              </Text>
            </View>

            <View style={styles.sessionsList}>
              {visibleSessions.map(session => (
                <TrainingSessionCard key={session.id} session={session} />
              ))}
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
                    : `Show ${ALL_SESSIONS.length - 3} More Sessions`}
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
});
