import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { ACWRResult, ACWRRisk } from '../../utils/ACWRCalculator';
import { useTheme, ThemeColors } from '../../theme/ThemeContext';

// ─── Risk zone config ─────────────────────────────────────────────────────────

const RISK_CONFIG: Record<ACWRRisk, { label: string; color: string }> = {
  detraining: { label: 'Detraining', color: '#60a5fa' },
  optimal: { label: 'Optimal', color: '#4ade80' },
  moderate_risk: { label: 'Moderate Risk', color: '#fbbf24' },
  high_risk: { label: 'High Risk', color: '#f87171' },
  insufficient_data: { label: 'Not Enough Data', color: '#94a3b8' },
};

const ZONE_ORDER: ACWRRisk[] = [
  'detraining',
  'optimal',
  'moderate_risk',
  'high_risk',
];

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  visible: boolean;
  result: ACWRResult;
  onClose: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function TrainingLoadModal({ visible, result, onClose }: Props) {
  const { c } = useTheme();
  const risk = RISK_CONFIG[result.risk];
  const monotonyLabel =
    result.monotony < 1
      ? 'High variety'
      : result.monotony < 2
      ? 'Moderate variety'
      : 'Low variety';

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.sheet, { backgroundColor: c.backgroundSolid }]}>
        {/* Drag handle */}
        <View style={[styles.handle, { backgroundColor: c.border }]} />

        {/* Header */}
        <View style={[styles.header, { borderBottomColor: c.border }]}>
          <Text style={[styles.title, { color: c.foreground }]}>
            Training Load
          </Text>
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeBtn}
            accessibilityLabel="Close"
          >
            <Text style={[styles.closeTxt, { color: c.muted }]}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* ── ACWR hero ─────────────────────────────────────────────────── */}
          <View
            style={[
              styles.heroCard,
              { backgroundColor: c.surface, borderColor: c.border },
            ]}
          >
            <View style={styles.heroTop}>
              <View>
                <Text style={[styles.heroLabel, { color: c.muted }]}>
                  Acute:Chronic Workload Ratio
                </Text>
                <Text style={[styles.heroValue, { color: c.foreground }]}>
                  {result.acwr != null ? result.acwr.toFixed(2) : '—'}
                </Text>
              </View>
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor: risk.color + '22',
                    borderColor: risk.color + '55',
                  },
                ]}
              >
                <View
                  style={[styles.badgeDot, { backgroundColor: risk.color }]}
                />
                <Text style={[styles.badgeText, { color: risk.color }]}>
                  {risk.label}
                </Text>
              </View>
            </View>

            {/* Risk scale bar */}
            <View style={styles.scaleRow}>
              {ZONE_ORDER.map(zone => {
                const z = RISK_CONFIG[zone];
                const active = result.risk === zone;
                return (
                  <View
                    key={zone}
                    style={[
                      styles.scaleSegment,
                      {
                        backgroundColor: active ? z.color : z.color + '30',
                        borderColor: active ? z.color : 'transparent',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.scaleText,
                        { color: active ? '#fff' : z.color },
                      ]}
                      numberOfLines={1}
                    >
                      {z.label}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* ── Metrics grid ──────────────────────────────────────────────── */}
          <View style={styles.grid}>
            <MetricBox
              label="Acute Load"
              value={String(result.acuteLoad)}
              unit="TRIMP"
              sub="Last 7 days"
              c={c}
            />
            <MetricBox
              label="Chronic Load"
              value={String(result.chronicLoad)}
              unit="TRIMP"
              sub="28-day avg"
              c={c}
            />
            <MetricBox
              label="Monotony"
              value={result.monotony.toFixed(2)}
              unit=""
              sub={monotonyLabel}
              c={c}
            />
            <MetricBox
              label="Strain"
              value={String(result.strain)}
              unit=""
              sub="Weekly stress"
              c={c}
            />
          </View>

          {/* ── Interpretation ────────────────────────────────────────────── */}
          {result.acwr != null && (
            <View
              style={[
                styles.interpretCard,
                { backgroundColor: c.surface, borderColor: c.border },
              ]}
            >
              <Text style={[styles.interpretText, { color: c.foreground }]}>
                {result.interpretation}
              </Text>
            </View>
          )}

          {/* ── Metric explanations ───────────────────────────────────────── */}
          <ExplainBox
            label="What is TRIMP?"
            text="Training Impulse — a single number that captures how hard a session actually was. It combines how long you exercised with how high your heart rate was the whole time. A gentle 60-minute jog and an all-out 20-minute interval session are very different stresses on your body, and TRIMP reflects that difference. All the other numbers on this screen (Acute Load, Chronic Load, Strain) are built from your session TRIMPs."
            c={c}
          />
          <ExplainBox
            label="What is ACWR?"
            text="How hard you've trained this week compared to your normal level. Think of it like a speedometer for your workload. The sweet spot is 0.8–1.3 — you're pushing hard enough to improve but not so fast that your body can't keep up. Above 1.5 means you've ramped up quicker than you're used to, which raises injury risk."
            c={c}
          />
          <ExplainBox
            label="What is Monotony?"
            text="How similar your training days are to each other. A low score means you're mixing hard and easy days, giving your body time to recover. A high score means every day feels about the same — this can sneak up on you because you feel fine day-to-day, but hidden fatigue builds up behind the scenes."
            c={c}
          />
          <ExplainBox
            label="What is Strain?"
            text="Your overall weekly stress level — how much total work you did, weighted by how repetitive it was. A high number doesn't automatically mean something's wrong, but if both your Strain and ACWR are high at the same time, it's a signal that your body probably hasn't had enough recovery time."
            c={c}
          />

          {/* ── Footer ───────────────────────────────────────────────────── */}
          <Text style={[styles.footer, { color: c.muted }]}>
            Based on {result.daysOfData} training day
            {result.daysOfData !== 1 ? 's' : ''} logged in the last 28 days
          </Text>
        </ScrollView>
      </View>
    </Modal>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function MetricBox({
  label,
  value,
  unit,
  sub,
  c,
}: {
  label: string;
  value: string;
  unit: string;
  sub: string;
  c: ThemeColors;
}) {
  return (
    <View
      style={[
        styles.metricBox,
        { backgroundColor: c.surface, borderColor: c.border },
      ]}
    >
      <Text style={[styles.metricLabel, { color: c.muted }]}>{label}</Text>
      <Text style={[styles.metricValue, { color: c.foreground }]}>
        {value}
        {unit ? (
          <Text style={[styles.metricUnit, { color: c.muted }]}> {unit}</Text>
        ) : null}
      </Text>
      <Text style={[styles.metricSub, { color: c.muted }]}>{sub}</Text>
    </View>
  );
}

function ExplainBox({
  label,
  text,
  c,
}: {
  label: string;
  text: string;
  c: ThemeColors;
}) {
  return (
    <View
      style={[
        styles.explainBox,
        { backgroundColor: c.surface, borderColor: c.border },
      ]}
    >
      <Text style={[styles.explainLabel, { color: c.foreground }]}>
        {label}
      </Text>
      <Text style={[styles.explainText, { color: c.muted }]}>{text}</Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  sheet: {
    flex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
  closeTxt: {
    fontSize: 18,
  },
  content: {
    padding: 20,
    gap: 12,
  },
  // Hero card
  heroCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 14,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  heroValue: {
    fontSize: 48,
    fontWeight: '700',
    lineHeight: 52,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  badgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  // Risk scale bar
  scaleRow: {
    flexDirection: 'row',
    gap: 4,
  },
  scaleSegment: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 2,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  scaleText: {
    fontSize: 10,
    fontWeight: '600',
  },
  // Metrics grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metricBox: {
    width: '47.5%',
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    gap: 2,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 4,
  },
  metricUnit: {
    fontSize: 13,
    fontWeight: '400',
  },
  metricSub: {
    fontSize: 11,
    marginTop: 2,
  },
  // Interpretation
  interpretCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
  },
  interpretText: {
    fontSize: 14,
    lineHeight: 20,
  },
  // Explanations
  explainBox: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    gap: 6,
  },
  explainLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  explainText: {
    fontSize: 13,
    lineHeight: 19,
  },
  footer: {
    fontSize: 12,
    textAlign: 'center',
    paddingVertical: 8,
  },
});
