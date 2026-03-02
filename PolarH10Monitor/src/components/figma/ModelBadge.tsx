import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { figmaTheme as t } from '../../theme/figmaTheme';
import { useTheme } from '../../theme/ThemeContext';

interface ModelBadgeProps {
  modelName: string;
  onInfoClick: () => void;
}

export function ModelBadge({ modelName, onInfoClick }: ModelBadgeProps) {
  const { c } = useTheme();
  return (
    <View style={styles.row}>
      <View
        style={[
          styles.badge,
          { backgroundColor: c.surface, borderColor: c.border },
        ]}
      >
        <Text style={styles.sparkle}>✨</Text>
        <Text style={[styles.label, { color: c.foreground }]}>{modelName}</Text>
      </View>
      <TouchableOpacity
        style={[
          styles.infoBtn,
          { backgroundColor: c.surface, borderColor: c.border },
        ]}
        onPress={onInfoClick}
        activeOpacity={0.7}
      >
        <Text style={[styles.infoBtnText, { color: c.muted }]}>ⓘ</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: t.colors.surface,
    borderWidth: 1,
    borderColor: t.colors.border,
    borderRadius: t.radius.full,
  },
  sparkle: { fontSize: 14 },
  label: {
    fontSize: t.typography.sizes.sm,
    color: t.colors.foreground,
  },
  infoBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: t.colors.surface,
    borderWidth: 1,
    borderColor: t.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoBtnText: {
    fontSize: 16,
    color: t.colors.muted,
  },
});
