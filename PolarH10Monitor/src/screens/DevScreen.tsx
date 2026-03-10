/**
 * DevScreen.tsx
 *
 * Development-only utility screen. Never shown in production builds.
 * Accessible via the "Dev" tab that is injected into MainTabNavigator
 * only when __DEV__ === true.
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  secureWrite,
  secureRemove,
  SECURE_STORAGE_KEYS,
} from '../utils/secureStorage';
import EncryptedStorage from 'react-native-encrypted-storage';
import { figmaTheme as t } from '../theme/figmaTheme';
import { useAuthStore } from '../store/authStore';
import { useShallow } from 'zustand/react/shallow';
import { DummyDataGenerator } from '../services/DummyDataGenerator';
import { AnalyticsService } from '../services/AnalyticsService';
import { trainingContextService } from '../services/TrainingContextService';
import { sessionRepository } from '../services/SessionRepository';
import { summaryComputeService } from '../services/SummaryComputeService';
import { databaseService } from '../services/DatabaseService';
import { usePhysiologyStore } from '../store/physiologyStore';

const STORAGE_KEY = 'app-user';
const FALLBACK_PREFIX = 'secure_fallback_';

interface StorageEntry {
  key: string;
  rawValue: string;
}

// ─── small reusable card ───────────────────────────────────────────────────────
function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function ActionButton({
  label,
  onPress,
  danger,
  loading,
}: {
  label: string;
  onPress: () => void;
  danger?: boolean;
  loading?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[styles.btn, danger && styles.btnDanger]}
      onPress={onPress}
      disabled={loading}
      activeOpacity={0.75}
    >
      {loading ? (
        <ActivityIndicator color="#fff" size="small" />
      ) : (
        <Text style={styles.btnLabel}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

// ─── main screen ──────────────────────────────────────────────────────────────
export function DevScreen() {
  const { user, isAuthenticated, logout } = useAuthStore(
    useShallow(s => ({
      user: s.user,
      isAuthenticated: s.isAuthenticated,
      logout: s.logout,
    })),
  );

  const [asyncKeys, setAsyncKeys] = useState<StorageEntry[]>([]);
  const [busy, setBusy] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [lastContextDebug, setLastContextDebug] = useState<string | null>(null);

  // ── seed 4 weeks of synthetic training data ─────────────────────────────
  const handleSeedData = async () => {
    setSeeding(true);
    try {
      const physiology = usePhysiologyStore.getState().settings;
      const age = physiology?.ageYears ?? 30;
      const restingHeartRate = physiology?.restingHeartRate ?? 60;
      const maxHeartRate =
        physiology?.maxHeartRate != null ? physiology.maxHeartRate : 220 - age;
      const generator = new DummyDataGenerator({
        age,
        weight: physiology?.weightKg ?? 75,
        restingHeartRate,
        maxHeartRate,
      });
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 28);
      const sessions = generator.generateSessions(start, end, 4);
      const enriched = AnalyticsService.enrichSessionsWithTRIMP(sessions, {
        id: 'seed',
        age,
        weight: physiology?.weightKg ?? 75,
        restingHeartRate,
        maxHeartRate,
        sex: physiology?.sex,
      });
      await sessionRepository.upsertBatch(enriched as any, true);
      for (const s of enriched) {
        await summaryComputeService.recomputeForSession(s as any);
      }
      await refreshKeys();
      Alert.alert(
        '✅ Seeded',
        `${enriched.length} sessions generated for the last 28 days.`,
      );
    } catch (e) {
      Alert.alert('Error', String(e));
    } finally {
      setSeeding(false);
    }
  };

  const handleClearSeededData = async () => {
    await sessionRepository.deleteSeeded();
    setLastContextDebug(null);
    await refreshKeys();
  };

  const handleInspectContext = async () => {
    try {
      const { contextBlock, debug } =
        await trainingContextService.buildContext();
      setLastContextDebug(
        `Sessions: ${debug.sessionCount} | ACWR: ${debug.acwr ?? 'n/a'} (${
          debug.acwrRisk
        })\n` +
          `Acute: ${debug.acuteLoad} | Chronic: ${debug.chronicLoad}\n\n` +
          contextBlock,
      );
    } catch (e) {
      setLastContextDebug(`Error: ${String(e)}`);
    }
  };

  // ── load all AsyncStorage keys ────────────────────────────────────────────
  const refreshKeys = useCallback(async () => {
    setRefreshing(true);
    try {
      const keys = await AsyncStorage.getAllKeys();
      const pairs = await AsyncStorage.multiGet(keys as string[]);
      setAsyncKeys(
        pairs.map(([k, v]) => ({ key: k, rawValue: v ?? '(null)' })),
      );
    } catch (e) {
      console.warn('[DevScreen] AsyncStorage read error:', e);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    refreshKeys();
  }, [refreshKeys]);

  // ── delete logged-in user ─────────────────────────────────────────────────
  const handleDeleteUser = () => {
    Alert.alert(
      'Delete current user?',
      user
        ? `This will remove "${user.name}" (${user.email}) and log you out.`
        : 'No user is currently logged in.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setBusy(true);
            try {
              await logout();
              await refreshKeys();
            } finally {
              setBusy(false);
            }
          },
        },
      ],
    );
  };

  // ── wipe ALL AsyncStorage ─────────────────────────────────────────────────
  const handleWipeAsyncStorage = () => {
    Alert.alert(
      'Wipe all AsyncStorage?',
      'This removes every key in AsyncStorage, including cached data and the auth fallback. The app will behave as a fresh install.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Wipe',
          style: 'destructive',
          onPress: async () => {
            setBusy(true);
            try {
              // Also wipe encrypted session/device keys
              await Promise.allSettled(
                SECURE_STORAGE_KEYS.map(k => secureRemove(k)),
              );
              await sessionRepository.deleteAll();
              await AsyncStorage.clear();
              await refreshKeys();
            } finally {
              setBusy(false);
            }
          },
        },
      ],
    );
  };

  // ── wipe EncryptedStorage auth key ────────────────────────────────────────
  const handleWipeEncryptedUser = () => {
    Alert.alert(
      'Remove encrypted user key?',
      `Removes "${STORAGE_KEY}" from EncryptedStorage (Keychain / EncryptedSharedPreferences) and the AsyncStorage fallback. User in memory is unaffected until you restart.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            setBusy(true);
            try {
              await secureRemove(STORAGE_KEY);
              await refreshKeys();
            } finally {
              setBusy(false);
            }
          },
        },
      ],
    );
  };

  // ── simulate stale DB (recovery path test) ────────────────────────────────
  // Deletes ONLY the SQLCipher key from Keychain, leaving the encrypted DB file
  // on disk. On the NEXT app launch, DatabaseService.initialize() must detect the
  // mismatch via the DDL try/catch and recreate the database cleanly.
  const handleSimulateStaleDb = () => {
    Alert.alert(
      'Simulate stale DB?',
      'Removes only the DB encryption key from Keychain — leaves the DB file on disk. Kills the in-memory handle. Relaunch the app to verify the recovery path fires and the app starts cleanly.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Simulate',
          style: 'destructive',
          onPress: async () => {
            setBusy(true);
            try {
              // Null the singleton handle without deleting the file
              await (databaseService as any)._simulateStaleForTest?.();
              await EncryptedStorage.removeItem('polar_db_key_v1');
              // Verify the key was actually deleted — helps diagnose if
              // removeItem silently fails (data persisting after relaunch
              // means the key was NOT removed).
              const keyAfter = await EncryptedStorage.getItem('polar_db_key_v1');
              Alert.alert(
                'Stale DB simulated',
                `DB file is still on disk.\nKey in Keychain after removeItem: ${
                  keyAfter ? `STILL PRESENT (${keyAfter.slice(0, 8)}…)` : 'DELETED ✓'
                }\n\nForce-quit and relaunch — you should see the recovery log and the app open cleanly with an empty DB.`,
              );
            } finally {
              setBusy(false);
            }
          },
        },
      ],
    );
  };

  // ── wipe encrypted storage entirely ──────────────────────────────────────
  const handleWipeEncryptedStorage = () => {
    Alert.alert(
      'Wipe all EncryptedStorage?',
      'Removes every item from the OS secure enclave for this app. Cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Wipe',
          style: 'destructive',
          onPress: async () => {
            setBusy(true);
            try {
              // 1. Close + delete the DB file BEFORE clearing EncryptedStorage
              //    so the key and file are never out of sync.
              await databaseService.closeAndDelete();
              // 2. Clear all keychain items (including the DB key + user session).
              await EncryptedStorage.clear();
              // 3. Re-initialize immediately with a fresh key so any still-mounted
              //    screens (CoachBanner, HomeScreen) query an empty DB instead of
              //    throwing "Database not initialized".
              await databaseService.initialize();
              // 4. Clear in-memory auth state.
              await logout();
              await refreshKeys();
            } finally {
              setBusy(false);
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      {/* ── header ── */}
      <View style={styles.header}>
        <Text style={styles.headerBadge}>🛠 DEV</Text>
        <Text style={styles.headerTitle}>Developer Tools</Text>
        <Text style={styles.headerSub}>Not visible in production builds</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── current user ── */}
        <Section title="Current User">
          {isAuthenticated && user ? (
            <View style={styles.userCard}>
              <View style={styles.avatarBubble}>
                <Text style={styles.avatarLabel}>{user.avatar}</Text>
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{user.name}</Text>
                <Text style={styles.userEmail}>{user.email}</Text>
                <Text style={styles.userId}>id: {user.id}</Text>
              </View>
            </View>
          ) : (
            <Text style={styles.emptyLabel}>No user logged in</Text>
          )}

          <ActionButton
            label="🗑  Delete Current User & Log Out"
            onPress={handleDeleteUser}
            danger
            loading={busy}
          />
        </Section>

        {/* ── storage actions ── */}
        <Section title="Storage">
          <ActionButton
            label="🔑  Remove Encrypted User Key"
            onPress={handleWipeEncryptedUser}
            danger
          />
          <ActionButton
            label="🔒  Wipe All EncryptedStorage"
            onPress={handleWipeEncryptedStorage}
            danger
          />
          <ActionButton
            label="🧪  Simulate Stale DB (recovery test)"
            onPress={handleSimulateStaleDb}
            danger
          />
          <ActionButton
            label="🗄  Wipe All AsyncStorage"
            onPress={handleWipeAsyncStorage}
            danger
          />
        </Section>

        {/* ── training data seed ── */}
        <Section title="Training Data (AI Context)">
          <ActionButton
            label={seeding ? 'Generating…' : '🏃  Seed 4 Weeks of Sessions'}
            onPress={handleSeedData}
            loading={seeding}
          />
          <ActionButton
            label="🔍  Inspect AI Context Block"
            onPress={handleInspectContext}
          />
          <ActionButton
            label="🗑  Clear Seeded Sessions"
            onPress={handleClearSeededData}
            danger
          />
          {lastContextDebug && (
            <View style={styles.keyRow}>
              <Text style={styles.keyName}>Context preview</Text>
              <Text style={styles.keyValue}>{lastContextDebug}</Text>
            </View>
          )}
        </Section>

        {/* ── async storage inspector ── */}
        <Section title={`AsyncStorage Keys (${asyncKeys.length})`}>
          <ActionButton
            label={refreshing ? 'Refreshing…' : '↻  Refresh'}
            onPress={refreshKeys}
            loading={refreshing}
          />
          {asyncKeys.length === 0 && !refreshing && (
            <Text style={styles.emptyLabel}>AsyncStorage is empty</Text>
          )}
          {asyncKeys.map(entry => (
            <View key={entry.key} style={styles.keyRow}>
              <Text style={styles.keyName} numberOfLines={1}>
                {entry.key}
              </Text>
              <Text style={styles.keyValue} numberOfLines={2}>
                {entry.rawValue.length > 120
                  ? entry.rawValue.slice(0, 120) + '…'
                  : entry.rawValue}
              </Text>
            </View>
          ))}
        </Section>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── styles ───────────────────────────────────────────────────────────────────
const c = t.colors;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: c.background },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: c.border,
    backgroundColor: c.surface,
  },
  headerBadge: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: '#f59e0b',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: c.foreground,
  },
  headerSub: {
    fontSize: 12,
    color: c.muted,
    marginTop: 2,
  },

  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 16 },

  section: {
    backgroundColor: c.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: c.border,
    padding: 16,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: c.muted,
    marginBottom: 2,
  },

  // User card
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(168,85,247,0.08)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.2)',
  },
  avatarBubble: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#a855f7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLabel: { fontSize: 18, fontWeight: '700', color: '#fff' },
  userInfo: { flex: 1, gap: 2 },
  userName: { fontSize: 15, fontWeight: '600', color: c.foreground },
  userEmail: { fontSize: 13, color: c.muted },
  userId: { fontSize: 11, color: c.muted, fontFamily: 'Courier' },
  emptyLabel: { fontSize: 13, color: c.muted, fontStyle: 'italic' },

  // Buttons
  btn: {
    backgroundColor: 'rgba(168,85,247,0.15)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.3)',
  },
  btnDanger: {
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderColor: 'rgba(239,68,68,0.3)',
  },
  btnLabel: { fontSize: 14, fontWeight: '600', color: c.foreground },

  // Storage inspector
  keyRow: {
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: c.border,
    padding: 10,
    gap: 4,
  },
  keyName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#a855f7',
    fontFamily: 'Courier',
  },
  keyValue: {
    fontSize: 11,
    color: c.muted,
    fontFamily: 'Courier',
  },
});
