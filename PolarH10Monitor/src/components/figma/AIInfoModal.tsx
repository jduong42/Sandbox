import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { figmaTheme as t } from '../../theme/figmaTheme';

interface AIInfoModalProps {
  visible: boolean;
  onClose: () => void;
  modelName: string;
}

export function AIInfoModal({ visible, onClose, modelName }: AIInfoModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={styles.card}>
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.headerLeft}>
                  <LinearGradient
                    colors={['#3b82f6', '#a855f7']}
                    style={styles.botIconGradient}
                  >
                    <Text style={styles.botEmoji}>🤖</Text>
                  </LinearGradient>
                  <Text style={styles.title}>AI Assistant Info</Text>
                </View>
                <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                  <Text style={styles.closeBtnText}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* Content */}
              <View style={styles.content}>
                <View style={styles.intro}>
                  <Text style={styles.introTitle}>
                    ✨ You're Talking with AI
                  </Text>
                  <Text style={styles.introBody}>
                    Powered by <Text style={styles.bold}>{modelName}</Text>,
                    running locally on your device. Private and never sent to
                    external servers.
                  </Text>
                </View>

                {[
                  {
                    emoji: '🛡️',
                    tint: t.colors.blueTint,
                    tintBorder: t.colors.blueTintBorder,
                    title: 'Privacy First',
                    body: 'All processing happens locally. Your data stays on your device.',
                  },
                  {
                    emoji: '⚡',
                    tint: t.colors.greenTint,
                    tintBorder: t.colors.greenTintBorder,
                    title: 'Real-time Responses',
                    body: 'Watch the AI generate responses word by word.',
                  },
                  {
                    emoji: '🏋️',
                    tint: t.colors.purpleTint,
                    tintBorder: t.colors.purpleTintBorder,
                    title: 'Fitness Focused',
                    body: 'Get advice based on your activity and training data.',
                  },
                ].map(item => (
                  <View key={item.title} style={styles.featureRow}>
                    <View
                      style={[
                        styles.featureIconBox,
                        {
                          backgroundColor: item.tint,
                          borderColor: item.tintBorder,
                        },
                      ]}
                    >
                      <Text style={styles.featureEmoji}>{item.emoji}</Text>
                    </View>
                    <View style={styles.featureText}>
                      <Text style={styles.featureTitle}>{item.title}</Text>
                      <Text style={styles.featureBody}>{item.body}</Text>
                    </View>
                  </View>
                ))}

                <View style={styles.disclaimer}>
                  <Text style={styles.disclaimerText}>
                    <Text style={styles.bold}>Note:</Text> AI responses are for
                    informational purposes only. Always consult healthcare
                    professionals for medical advice.
                  </Text>
                </View>
              </View>

              {/* Footer */}
              <View style={styles.footer}>
                <TouchableOpacity onPress={onClose} activeOpacity={0.8}>
                  <LinearGradient
                    colors={[t.colors.primary, t.colors.primaryTo]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.footerButton}
                  >
                    <Text style={styles.footerButtonText}>Got it, thanks!</Text>
                  </LinearGradient>
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
  botIconGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botEmoji: { fontSize: 18 },
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
    fontWeight: t.typography.weights.medium,
  },
  content: { padding: t.spacing.xl },
  intro: { marginBottom: t.spacing.xl },
  introTitle: {
    fontSize: t.typography.sizes.base,
    fontWeight: t.typography.weights.semibold,
    color: t.colors.foreground,
    marginBottom: t.spacing.sm,
  },
  introBody: {
    fontSize: t.typography.sizes.sm,
    color: t.colors.muted,
    lineHeight: 20,
  },
  bold: { fontWeight: t.typography.weights.bold, color: t.colors.foreground },
  featureRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: t.spacing.lg,
  },
  featureIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  featureEmoji: { fontSize: 18 },
  featureText: { flex: 1 },
  featureTitle: {
    fontSize: t.typography.sizes.base,
    fontWeight: t.typography.weights.medium,
    color: t.colors.foreground,
    marginBottom: 2,
  },
  featureBody: {
    fontSize: t.typography.sizes.sm,
    color: t.colors.muted,
    lineHeight: 18,
  },
  disclaimer: {
    marginTop: t.spacing.sm,
    padding: t.spacing.md,
    backgroundColor: t.colors.amberTint,
    borderWidth: 1,
    borderColor: t.colors.amberTintBorder,
    borderRadius: t.radius.md,
  },
  disclaimerText: {
    fontSize: t.typography.sizes.xs,
    color: '#fde68a',
    lineHeight: 17,
  },
  footer: {
    padding: t.spacing.xl,
    borderTopWidth: 1,
    borderTopColor: t.colors.border,
  },
  footerButton: {
    paddingVertical: t.spacing.lg,
    borderRadius: t.radius.md,
    alignItems: 'center',
    minHeight: 56,
    justifyContent: 'center',
  },
  footerButtonText: {
    color: '#fff',
    fontSize: t.typography.sizes.base,
    fontWeight: t.typography.weights.semibold,
  },
});
