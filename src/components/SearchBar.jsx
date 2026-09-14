// ============================================================
// SearchBar – Barra de búsqueda reutilizable
// ============================================================

import React from 'react';
import { View, StyleSheet, TextInput as RNTextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography, shadows } from '../theme/theme';

export default function SearchBar({ value, onChangeText, placeholder = 'Buscar...', id }) {
  return (
    <View style={styles.container} id={id}>
      <Ionicons name="search-outline" size={20} color={colors.textSecondary} style={styles.icon} />
      <RNTextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textLight}
        style={styles.input}
        returnKeyType="search"
        clearButtonMode="while-editing"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    height: 50,
    ...shadows.md,
  },
  icon: { marginRight: spacing.sm },
  input: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.text,
    height: '100%',
  },
});
