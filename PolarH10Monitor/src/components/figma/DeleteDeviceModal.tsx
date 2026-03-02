import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
} from 'react-native';
import { figmaTheme as t } from '../../theme/figmaTheme';

export interface BLEDevice {
  id: string;
  name: string;
  batteryLevel: number;
  isActive: boolean;
  lastConnected: string;
}

interface DeleteDeviceModalProps {
  device: BLEDevice;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteDeviceModal({
  device,
  onConfirm,
  onCancel,
}: DeleteDeviceModalProps) {
  return (
    <Modal visible transparent animationType="fade" onRequestClose={onCancel}>
      <TouchableWithoutFeedback onPress={onCancel}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={styles.card}>
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.headerLeft}>
                  <View style={styles.alertIcon}>
                    <Text style={styles.alertEmoji}>⚠️</Text>
                  </View>
                  <Text style={styles.title}>Forget Device</Text>
                </View>
                <TouchableOpacity style={styles.closeBtn} onPress={onCancel}>
                  <Text style={styles.closeBtnText}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* Body */}
              <View style={styles.body}>
                <Text style={styles.bodyText}>
                  Are you sure you want to forget{' '}
                  <Text style={styles.bold}>{device.name}</Text>?{'\n'}
                  You'll need to pair it again to use it with the app.
                </Text>
              </View>

              {/* Footer */}
              <View style={styles.footer}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={onCancel}
                  activeOpacity={0.8}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.confirmBtn}
                  onPress={onConfirm}
                  activeOpacity={0.8}
                >
                  <Text style={styles.confirmText}>Forget Device</Text>
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
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: t.spacing.xl,
  },
  card: {
    backgroundColor: t.colors.surface,
    borderRadius: t.radius.xxl,
    borderWidth: 1,
    borderColor: t.colors.border,
    width: '100%',
    maxWidth: 420,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: t.spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: t.colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  alertIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: t.colors.redTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertEmoji: { fontSize: 18 },
  title: {
    fontSize: t.typography.sizes.xl,
    fontWeight: t.typography.weights.semibold,
    color: t.colors.foreground,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: t.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: t.colors.foreground,
    fontSize: 16,
  },
  body: {
    padding: t.spacing.xl,
  },
  bodyText: {
    fontSize: t.typography.sizes.base,
    color: t.colors.muted,
    lineHeight: 22,
  },
  bold: {
    fontWeight: t.typography.weights.bold,
    color: t.colors.foreground,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: t.spacing.xl,
    borderTopWidth: 1,
    borderTopColor: t.colors.border,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: t.colors.accent,
    borderRadius: t.radius.md,
    paddingVertical: 12,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  cancelText: {
    color: t.colors.foreground,
    fontSize: t.typography.sizes.base,
    fontWeight: t.typography.weights.medium,
  },
  confirmBtn: {
    flex: 1,
    backgroundColor: t.colors.red,
    borderRadius: t.radius.md,
    paddingVertical: 12,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  confirmText: {
    color: '#fff',
    fontSize: t.typography.sizes.base,
    fontWeight: t.typography.weights.medium,
  },
});
