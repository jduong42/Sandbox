import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '../theme/ThemeContext';
import { useAuth } from '../context/AuthContext';
import {
  usePhysiologyStore,
  isPhysiologyComplete,
  PhysiologySettings,
} from '../store/physiologyStore';
import {
  ActivityLevel,
  ACTIVITY_LABELS,
  Sex,
} from '../utils/CalorieCalculator';
import { RootStackParamList } from '../navigation/NavigationTypes';
import { useToast } from '../hooks/useToast';
import { Toast } from '../components/common/Toast';

type Nav = StackNavigationProp<RootStackParamList, 'ProfileSettings'>;

// ─── Activity level option list ───────────────────────────────────────────────

const ACTIVITY_OPTIONS: { value: ActivityLevel; detail: string }[] = [
  { value: 'sedentary', detail: 'Desk job, little or no exercise' },
  { value: 'light', detail: 'Light exercise 1–3 days/week' },
  { value: 'moderate', detail: 'Moderate exercise 3–5 days/week' },
  { value: 'active', detail: 'Hard exercise 6–7 days/week' },
  { value: 'extra', detail: 'Physical job or professional athlete' },
];

// ─── Screen ───────────────────────────────────────────────────────────────────

export function FigmaProfileSettingsScreen() {
  const navigation = useNavigation<Nav>();
  const { c } = useTheme();
  const { user, logout } = useAuth();
  const { settings, initialize, updateSettings, isLoaded } =
    usePhysiologyStore();

  // ── Local form state (mirrors store until Save is tapped) ──────────────────
  const [sex, setSex] = useState<Sex | undefined>(settings.sex);
  const [age, setAge] = useState(
    settings.ageYears != null ? String(settings.ageYears) : '',
  );
  const [height, setHeight] = useState(
    settings.heightCm != null ? String(settings.heightCm) : '',
  );
  const [weight, setWeight] = useState(
    settings.weightKg != null ? String(settings.weightKg) : '',
  );
  const [activityLevel, setActivityLevel] = useState<ActivityLevel | undefined>(
    settings.activityLevel,
  );
  const [bodyFat, setBodyFat] = useState(
    settings.bodyFatFraction != null
      ? String(Math.round(settings.bodyFatFraction * 100))
      : '',
  );
  const [restingHR, setRestingHR] = useState(
    settings.restingHeartRate != null ? String(settings.restingHeartRate) : '',
  );
  const [maxHR, setMaxHR] = useState(
    settings.maxHeartRate != null ? String(settings.maxHeartRate) : '',
  );

  const [isSaving, setIsSaving] = useState(false);
  const { toast, show, hide } = useToast();

  // Sync local state if store loads after component mounts
  useEffect(() => {
    if (!isLoaded) initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    setSex(settings.sex);
    setAge(settings.ageYears != null ? String(settings.ageYears) : '');
    setHeight(settings.heightCm != null ? String(settings.heightCm) : '');
    setWeight(settings.weightKg != null ? String(settings.weightKg) : '');
    setActivityLevel(settings.activityLevel);
    setBodyFat(
      settings.bodyFatFraction != null
        ? String(Math.round(settings.bodyFatFraction * 100))
        : '',
    );
    setRestingHR(
      settings.restingHeartRate != null
        ? String(settings.restingHeartRate)
        : '',
    );
    setMaxHR(
      settings.maxHeartRate != null ? String(settings.maxHeartRate) : '',
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded]);

  // ── Validation ────────────────────────────────────────────────────────────

  function validate(): string | null {
    if (age !== '') {
      const n = Number(age);
      if (!Number.isInteger(n) || n < 10 || n > 120)
        return 'Age must be a whole number between 10 and 120.';
    }
    if (height !== '') {
      const n = Number(height);
      if (isNaN(n) || n < 50 || n > 280)
        return 'Height must be between 50 and 280 cm.';
    }
    if (weight !== '') {
      const n = Number(weight);
      if (isNaN(n) || n < 20 || n > 500)
        return 'Weight must be between 20 and 500 kg.';
    }
    if (bodyFat !== '') {
      const n = Number(bodyFat);
      if (isNaN(n) || n < 1 || n > 70)
        return 'Body fat % must be between 1 and 70.';
    }
    if (restingHR !== '') {
      const n = Number(restingHR);
      if (!Number.isInteger(n) || n < 30 || n > 100)
        return 'Resting heart rate must be a whole number between 30 and 100 bpm.';
    }
    if (maxHR !== '') {
      const n = Number(maxHR);
      if (!Number.isInteger(n) || n < 100 || n > 220)
        return 'Max heart rate must be a whole number between 100 and 220 bpm.';
    }
    return null;
  }

  // ── Save ──────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    const validationError = validate();
    if (validationError) {
      show(validationError, 'error');
      return;
    }
    setIsSaving(true);
    try {
      const patch: Partial<PhysiologySettings> = {
        sex: sex,
        ageYears: age !== '' ? Number(age) : undefined,
        heightCm: height !== '' ? Number(height) : undefined,
        weightKg: weight !== '' ? Number(weight) : undefined,
        activityLevel: activityLevel,
        bodyFatFraction: bodyFat !== '' ? Number(bodyFat) / 100 : undefined,
        restingHeartRate: restingHR !== '' ? Number(restingHR) : undefined,
        // null means "derive from age"; undefined means "not changed"
        maxHeartRate: maxHR !== '' ? Number(maxHR) : null,
      };
      await updateSettings(patch);
      show('Profile saved! ✓', 'success');
      setTimeout(() => navigation.goBack(), 1500);
    } catch {
      show('Failed to save. Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // ── Completeness hint ─────────────────────────────────────────────────────

  const localComplete = isPhysiologyComplete({
    sex,
    ageYears: age !== '' ? Number(age) : undefined,
    heightCm: height !== '' ? Number(height) : undefined,
    weightKg: weight !== '' ? Number(weight) : undefined,
  });

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <LinearGradient colors={c.background} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Custom header */}
        <View style={[styles.navHeader, { borderBottomColor: c.border }]}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
            accessibilityLabel="Go back"
          >
            <Text style={[styles.backBtnText, { color: c.foreground }]}>
              ← Back
            </Text>
          </TouchableOpacity>
          <Text style={[styles.navTitle, { color: c.foreground }]}>
            Profile Settings
          </Text>
          <View style={styles.navRight} />
        </View>

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* ── Privacy Banner ─────────────────────────────────────────── */}
            <View
              style={[
                styles.privacyBanner,
                {
                  backgroundColor: c.amberTint,
                  borderColor: 'rgba(245,158,11,0.4)',
                },
              ]}
            >
              <Text style={styles.privacyIcon}>🔒</Text>
              <Text style={[styles.privacyText, { color: c.foreground }]}>
                Your physiological data is encrypted with AES-256 and stored
                exclusively on this device using the OS secure enclave. It is{' '}
                <Text style={styles.privacyBold}>
                  never uploaded or shared.
                </Text>
              </Text>
            </View>

            {/* ── Account info (read-only) ───────────────────────────────── */}
            {user && (
              <SectionCard title="Account" c={c}>
                <InfoRow label="Name" value={user.name} c={c} />
                <InfoRow label="Email" value={user.email} c={c} />
              </SectionCard>
            )}

            {/* ── Physical Attributes ────────────────────────────────────── */}
            <SectionCard
              title="Physical Attributes"
              subtitle={
                !localComplete
                  ? 'Fill in all four fields for accurate calorie estimates'
                  : undefined
              }
              c={c}
            >
              {/* Sex */}
              <View style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, { color: c.muted }]}>Sex</Text>
                <View style={styles.sexRow}>
                  {(['male', 'female'] as Sex[]).map(s => (
                    <TouchableOpacity
                      key={s}
                      style={[
                        styles.sexBtn,
                        {
                          borderColor: sex === s ? '#a855f7' : c.border,
                          backgroundColor:
                            sex === s ? 'rgba(168,85,247,0.15)' : c.accent,
                        },
                      ]}
                      onPress={() => setSex(s)}
                    >
                      <Text style={styles.sexBtnIcon}>
                        {s === 'male' ? '♂' : '♀'}
                      </Text>
                      <Text
                        style={[
                          styles.sexBtnLabel,
                          {
                            color: sex === s ? '#a855f7' : c.foreground,
                            fontWeight: sex === s ? '600' : '400',
                          },
                        ]}
                      >
                        {s === 'male' ? 'Male' : 'Female'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <NumericField
                label="Age"
                unit="years"
                value={age}
                onChangeText={setAge}
                placeholder="e.g. 28"
                c={c}
              />
              <NumericField
                label="Height"
                unit="cm"
                value={height}
                onChangeText={setHeight}
                placeholder="e.g. 175"
                c={c}
              />
              <NumericField
                label="Weight"
                unit="kg"
                value={weight}
                onChangeText={setWeight}
                placeholder="e.g. 75"
                c={c}
              />
            </SectionCard>

            {/* ── Heart Rate ────────────────────────────────────────────── */}
            <SectionCard
              title="Heart Rate"
              subtitle="Improves Karvonen zone accuracy and Banister TRIMP"
              c={c}
            >
              <NumericField
                label="Resting HR"
                unit="bpm"
                value={restingHR}
                onChangeText={setRestingHR}
                placeholder="e.g. 60"
                c={c}
              />
              <NumericField
                label="Max HR"
                unit="bpm"
                value={maxHR}
                onChangeText={setMaxHR}
                placeholder={`e.g. ${
                  age !== '' ? 220 - Number(age) : 190
                } (220 − age)`}
                c={c}
              />
              <Text style={[styles.advancedHint, { color: c.muted }]}>
                Leave Max HR blank to use the 220 − age estimate. Setting your
                measured values significantly improves training zone and TRIMP
                accuracy.
              </Text>
            </SectionCard>

            {/* ── Activity Level ────────────────────────────────────────── */}
            <SectionCard title="Activity Level" c={c}>
              {ACTIVITY_OPTIONS.map(opt => (
                <TouchableOpacity
                  key={opt.value}
                  style={[
                    styles.activityRow,
                    {
                      borderColor:
                        activityLevel === opt.value ? '#a855f7' : c.border,
                      backgroundColor:
                        activityLevel === opt.value
                          ? 'rgba(168,85,247,0.10)'
                          : 'transparent',
                    },
                  ]}
                  onPress={() => setActivityLevel(opt.value)}
                >
                  <View style={styles.activityRadio}>
                    <View
                      style={[
                        styles.radioOuter,
                        {
                          borderColor:
                            activityLevel === opt.value ? '#a855f7' : c.muted,
                        },
                      ]}
                    >
                      {activityLevel === opt.value && (
                        <View style={styles.radioInner} />
                      )}
                    </View>
                  </View>
                  <View style={styles.activityText}>
                    <Text
                      style={[styles.activityLabel, { color: c.foreground }]}
                    >
                      {ACTIVITY_LABELS[opt.value]}
                    </Text>
                    <Text style={[styles.activityDetail, { color: c.muted }]}>
                      {opt.detail}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </SectionCard>

            {/* ── Advanced / Optional ────────────────────────────────────── */}
            <SectionCard
              title="Advanced (Optional)"
              subtitle="Improves calorie accuracy when known"
              c={c}
            >
              <NumericField
                label="Body Fat"
                unit="%"
                value={bodyFat}
                onChangeText={setBodyFat}
                placeholder="e.g. 18"
                c={c}
              />
              <Text style={[styles.advancedHint, { color: c.muted }]}>
                Enables the Katch-McArdle formula which is more accurate than
                Mifflin-St Jeor when body composition is known.
              </Text>
            </SectionCard>

            {/* ── Error / save feedback ─────────────────────────────────── */}
            {/* ── Save button ───────────────────────────────────────────── */}
            <LinearGradient
              colors={
                isSaving ? ['#6b7280', '#6b7280'] : ['#a855f7', '#ec4899']
              }
              style={styles.saveGradient}
            >
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleSave}
                disabled={isSaving}
                accessibilityLabel="Save profile settings"
              >
                {isSaving ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.saveBtnLabel}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </LinearGradient>

            {/* ── Danger zone ───────────────────────────────────────────── */}
            {user && (
              <TouchableOpacity
                style={[
                  styles.logoutBtn,
                  { borderColor: 'rgba(239,68,68,0.3)' },
                ]}
                onPress={() => {
                  logout();
                  navigation.goBack();
                }}
              >
                <Text style={styles.logoutBtnText}>🚪 Log Out</Text>
              </TouchableOpacity>
            )}

            <View style={styles.bottomPad} />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onDismiss={hide}
      />
    </LinearGradient>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionCard({
  title,
  subtitle,
  children,
  c,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  c: Record<string, any>;
}) {
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: c.surface, borderColor: c.border },
      ]}
    >
      <Text style={[styles.cardTitle, { color: c.foreground }]}>{title}</Text>
      {subtitle && (
        <Text style={[styles.cardSubtitle, { color: c.muted }]}>
          {subtitle}
        </Text>
      )}
      <View style={styles.cardBody}>{children}</View>
    </View>
  );
}

function InfoRow({
  label,
  value,
  c,
}: {
  label: string;
  value: string;
  c: Record<string, any>;
}) {
  return (
    <View style={[styles.infoRow, { borderBottomColor: c.border }]}>
      <Text style={[styles.infoLabel, { color: c.muted }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: c.foreground }]}>{value}</Text>
    </View>
  );
}

function NumericField({
  label,
  unit,
  value,
  onChangeText,
  placeholder,
  c,
}: {
  label: string;
  unit: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
  c: Record<string, any>;
}) {
  return (
    <View style={styles.numericFieldRow}>
      <Text style={[styles.numericFieldLabel, { color: c.muted }]}>
        {label}
      </Text>
      <View style={styles.numericInputWrap}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={c.muted}
          keyboardType="decimal-pad"
          style={[
            styles.numericInput,
            {
              backgroundColor: c.accent,
              borderColor: c.border,
              color: c.foreground,
            },
          ]}
          accessibilityLabel={label}
        />
        <Text style={[styles.numericUnit, { color: c.muted }]}>{unit}</Text>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  flex: { flex: 1 },

  // Header
  navHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  backBtn: { minWidth: 80 },
  backBtnText: { fontSize: 15 },
  navTitle: { fontSize: 17, fontWeight: '600' },
  navRight: { minWidth: 80 },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 16 },
  bottomPad: { height: 32 },

  // Privacy banner
  privacyBanner: {
    flexDirection: 'row',
    gap: 10,
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    alignItems: 'flex-start',
  },
  privacyIcon: { fontSize: 18, marginTop: 1 },
  privacyText: { flex: 1, fontSize: 13, lineHeight: 19 },
  privacyBold: { fontWeight: '600' },

  // Section card
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },
  cardTitle: { fontSize: 15, fontWeight: '600', marginBottom: 2 },
  cardSubtitle: { fontSize: 12, marginBottom: 8 },
  cardBody: { gap: 12, marginTop: 12 },

  // Info row (read-only)
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  infoLabel: { fontSize: 13 },
  infoValue: { fontSize: 13, fontWeight: '500' },

  // Sex toggle
  fieldGroup: { gap: 8 },
  fieldLabel: { fontSize: 12, fontWeight: '500' },
  sexRow: { flexDirection: 'row', gap: 10 },
  sexBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderRadius: 10,
    paddingVertical: 10,
  },
  sexBtnIcon: { fontSize: 18 },
  sexBtnLabel: { fontSize: 14 },

  // Numeric field
  numericFieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  numericFieldLabel: { fontSize: 14, flex: 1 },
  numericInputWrap: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  numericInput: {
    width: 90,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 15,
    textAlign: 'right',
  },
  numericUnit: { fontSize: 13, width: 36 },

  // Activity level
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1.5,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  activityRadio: { width: 20 },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#a855f7',
  },
  activityText: { flex: 1 },
  activityLabel: { fontSize: 14, fontWeight: '500' },
  activityDetail: { fontSize: 12, marginTop: 1 },

  // Advanced hint
  advancedHint: { fontSize: 12, lineHeight: 17, marginTop: 4 },

  // Save
  saveGradient: { borderRadius: 14, overflow: 'hidden' },
  saveBtn: {
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnLabel: { fontSize: 15, fontWeight: '600', color: '#fff' },

  // Logout
  logoutBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 14,
    height: 50,
    backgroundColor: 'rgba(239,68,68,0.07)',
  },
  logoutBtnText: { fontSize: 14, fontWeight: '500', color: '#ef4444' },
});
