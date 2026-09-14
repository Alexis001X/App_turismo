// ============================================================
// CategoryChip – Chip de categoría seleccionable
// ============================================================

import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { colors, spacing, borderRadius, typography } from '../theme/theme';

const CATEGORY_ICONS = {
  'Todos': '🌍',
  'Playa': '🏖️',
  'Montaña': '⛰️',
  'Ciudad': '🏙️',
  'Cultural': '🏛️',
  'Aventura': '🧗',
  'Naturaleza': '🌿',
};

export default function CategoryChip({ label, selected, onPress }) {
  const emoji = CATEGORY_ICONS[label] || '📍';

  return (
    <TouchableOpacity
      id={`category-chip-${label.toLowerCase()}`}
      style={[styles.chip, selected && styles.chipSelected]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[styles.label, selected && styles.labelSelected]}>
        {emoji} {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  labelSelected: {
    color: colors.white,
  },
});
