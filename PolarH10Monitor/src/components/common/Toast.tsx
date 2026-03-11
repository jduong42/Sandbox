import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ToastType } from '../../hooks/useToast';

/**
 * WCAG 2.2 compliant toast.
 *
 * Accessibility:
 *   • accessibilityRole="alert"  → VoiceOver reads it immediately on iOS
 *   • accessibilityLiveRegion="assertive" → TalkBack reads it immediately on Android
 *   • Progress bar is marked hidden from AT (decorative)
 *   • Dismiss button ≥ 44 × 44 pt touch target (WCAG 2.5.8)
 *   • Text contrast ≥ 7:1 on all variants (passes WCAG AAA 1.4.6)
 */

interface Config {
  /** Opaque background — ensures deterministic contrast regardless of underlay. */
  bg: string;
  border: string;
  /** Accent used for icon, bar and close button. Contrast vs bg ≥ 3:1 (WCAG 1.4.11). */
  bar: string;
  /** Body text colour. Contrast vs bg ≥ 7:1 (WCAG AAA). */
  text: string;
  icon: string;
  /** Screen-reader label for the leading icon badge. */
  typeLabel: string;
}

const TYPE_CONFIG: Record<ToastType, Config> = {
  // green-950 bg (#052e16) + green-100 text (#dcfce7): contrast ~12:1 ✓ AAA
  success: {
    bg: '#052e16',
    border: '#166534',
    bar: '#4ade80',
    text: '#dcfce7',
    icon: '✓',
    typeLabel: 'Success',
  },
  // red-950 bg (#450a0a) + red-100 text (#fee2e2): contrast ~11:1 ✓ AAA
  error: {
    bg: '#450a0a',
    border: '#991b1b',
    bar: '#f87171',
    text: '#fee2e2',
    icon: '!',
    typeLabel: 'Error',
  },
  // orange-950 bg (#431407) + orange-100 text (#ffedd5): contrast ~10:1 ✓ AAA
  warning: {
    bg: '#431407',
    border: '#9a3412',
    bar: '#fb923c',
    text: '#ffedd5',
    icon: '⚠',
    typeLabel: 'Warning',
  },
};

interface ToastProps {
  visible: boolean;
  message: string;
  type: ToastType;
  /** Must match the durationMs passed to useToast so the progress bar stays in sync. */
  duration?: number;
  onDismiss: () => void;
}

/**
 * Animated floating toast.
 * Render at the bottom of a `position: 'relative'` screen container — the
 * component is absolutely positioned and floats above all content.
 */
export function Toast({
  visible,
  message,
  type,
  duration = 4500,
  onDismiss,
}: ToastProps) {
  const insets = useSafeAreaInsets();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(24)).current;
  // Progress: 1 = full bar (just appeared), 0 = empty (about to dismiss)
  const progress = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (visible) {
      // Reset progress for each new appearance
      progress.setValue(1);
      // Slide in + fade in
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 260,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          damping: 18,
          stiffness: 180,
        }),
      ]).start();
      // Drain progress bar over the full display duration
      progressAnim.current = Animated.timing(progress, {
        toValue: 0,
        duration,
        useNativeDriver: false, // width % can't use native driver
      });
      progressAnim.current.start();
    } else {
      progressAnim.current?.stop();
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 320,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 24,
          duration: 320,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, duration, opacity, translateY, progress]);

  const cfg = TYPE_CONFIG[type];

  return (
    <Animated.View
      pointerEvents={visible ? 'auto' : 'none'}
      // WCAG 4.1.3 Status Messages: role="alert" causes VoiceOver/TalkBack
      // to announce the content without requiring focus.
      accessibilityRole="alert"
      // Android: assertive live region for immediate announcement
      accessibilityLiveRegion={
        Platform.OS === 'android' ? 'assertive' : undefined
      }
      accessibilityLabel={`${cfg.typeLabel}: ${message}`}
      style={[
        styles.container,
        {
          opacity,
          transform: [{ translateY }],
          backgroundColor: cfg.bg,
          borderColor: cfg.border,
          // Float above the home indicator (safe area bottom + margin)
          bottom: insets.bottom + 16,
        },
      ]}
    >
      {/* Leading type badge — hidden from AT, WCAG 1.1.1 (type already in label) */}
      <View
        style={[styles.iconWrap, { backgroundColor: cfg.border }]}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <Text style={[styles.icon, { color: cfg.bar }]}>{cfg.icon}</Text>
      </View>

      {/* Message — WCAG 1.4.3: contrast ≥ 4.5:1 (actual ≥ 10:1 for all variants) */}
      <Text style={[styles.message, { color: cfg.text }]} numberOfLines={4}>
        {message}
      </Text>

      {/* Dismiss button — WCAG 2.5.8: ≥ 24×24 CSS px interactive area */}
      <TouchableOpacity
        onPress={onDismiss}
        // 44×44 total touch target satisfies both WCAG 2.5.8 and Apple HIG
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        style={styles.closeBtn}
        accessibilityRole="button"
        accessibilityLabel="Dismiss notification"
      >
        <Text style={[styles.closeText, { color: cfg.bar }]}>✕</Text>
      </TouchableOpacity>

      {/* Timeline progress bar — decorative, hidden from AT */}
      <View
        style={styles.progressTrack}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <Animated.View
          style={[
            styles.progressBar,
            {
              backgroundColor: cfg.bar,
              width: progress.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>
    </Animated.View>
  );
}
const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 16,
    // Extra bottom padding to leave room for the 3px progress bar
    paddingTop: 14,
    paddingBottom: 20,
    paddingHorizontal: 14,
    gap: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  iconWrap: {
    // 32×32 badge; touch target covered by parent's hitSlop
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  icon: {
    fontSize: 15,
    fontWeight: '700',
  },
  message: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  closeBtn: {
    // Visible area 24×24; touch area extended to 44×44 by hitSlop
    width: 24,
    height: 24,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 14,
    fontWeight: '700',
  },
  progressTrack: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  progressBar: {
    height: 3,
    borderRadius: 1.5,
  },
});
