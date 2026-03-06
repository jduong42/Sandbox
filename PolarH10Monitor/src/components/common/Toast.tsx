import React, { useEffect, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ToastType } from '../../hooks/useToast';

interface Config {
  bg: string;
  border: string;
  iconColor: string;
  icon: string;
  label: string;
}

const TYPE_CONFIG: Record<ToastType, Config> = {
  success: {
    bg: 'rgba(34,197,94,0.14)',
    border: 'rgba(34,197,94,0.45)',
    iconColor: '#22c55e',
    icon: '✓',
    label: 'Success',
  },
  error: {
    bg: 'rgba(239,68,68,0.14)',
    border: 'rgba(239,68,68,0.45)',
    iconColor: '#ef4444',
    icon: '!',
    label: 'Error',
  },
  warning: {
    bg: 'rgba(245,158,11,0.14)',
    border: 'rgba(245,158,11,0.45)',
    iconColor: '#f59e0b',
    icon: '⚠',
    label: 'Warning',
  },
};

interface ToastProps {
  visible: boolean;
  message: string;
  type: ToastType;
  onDismiss: () => void;
}

/**
 * Animated floating toast.
 * Render this component at the bottom of whichever view you want it to float
 * over, using `position: 'absolute'` layout (already handled in the styles
 * below — just drop it into your view tree).
 */
export function Toast({ visible, message, type, onDismiss }: ToastProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    if (visible) {
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
    } else {
      // Slide back down and fade
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
  }, [visible, opacity, translateY]);

  const cfg = TYPE_CONFIG[type];

  return (
    <Animated.View
      pointerEvents={visible ? 'auto' : 'none'}
      style={[
        styles.container,
        {
          opacity,
          transform: [{ translateY }],
          backgroundColor: cfg.bg,
          borderColor: cfg.border,
        },
      ]}
    >
      {/* Colour-coded leading icon */}
      <View style={[styles.iconWrap, { backgroundColor: cfg.border }]}>
        <Text style={[styles.icon, { color: cfg.iconColor }]}>{cfg.icon}</Text>
      </View>

      {/* Message */}
      <Text style={styles.message} numberOfLines={4}>
        {message}
      </Text>

      {/* Dismiss button */}
      <TouchableOpacity
        onPress={onDismiss}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        style={styles.closeBtn}
        accessibilityLabel="Dismiss notification"
      >
        <Text style={[styles.closeText, { color: cfg.iconColor }]}>✕</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 12,
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  iconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  icon: {
    fontSize: 14,
    fontWeight: '700',
  },
  message: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: '#f1f5f9',
    fontWeight: '500',
  },
  closeBtn: {
    flexShrink: 0,
    padding: 2,
  },
  closeText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
