// ============================================================
// ProfileScreen – Perfil del usuario
// ============================================================

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text, Divider, Button, Switch } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { logoutUser } from '../firebase/auth';
import { useAuth } from '../hooks/useAuth';
import { colors, spacing, typography, borderRadius, shadows } from '../theme/theme';

export default function ProfileScreen({ navigation }) {
  const { user } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);

  const firstName = user?.displayName?.split(' ')[0] || 'Viajero';
  const avatarLetter = firstName.charAt(0).toUpperCase();

  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              await logoutUser();
            } catch (error) {
              Alert.alert('Error', error.message);
            }
          },
        },
      ]
    );
  };

  const MenuItem = ({ icon, label, onPress, rightElement, color = colors.text }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.menuItemLeft}>
        <View style={[styles.menuIcon, { backgroundColor: `${colors.primary}15` }]}>
          <Ionicons name={icon} size={20} color={colors.primary} />
        </View>
        <Text style={[styles.menuLabel, { color }]}>{label}</Text>
      </View>
      {rightElement || <Ionicons name="chevron-forward" size={18} color={colors.textLight} />}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{avatarLetter}</Text>
        </View>
        <Text style={styles.userName}>{user?.displayName || 'Viajero'}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
        <View style={styles.statsBadge}>
          <Text style={styles.statsText}>✈️ Explorador</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

        {/* Sección Cuenta */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>MI CUENTA</Text>
          <View style={styles.card}>
            <MenuItem icon="person-outline" label="Editar perfil" onPress={() => {}} />
            <Divider style={styles.divider} />
            <MenuItem icon="calendar-outline" label="Mis reservas" onPress={() => {}} />
            <Divider style={styles.divider} />
            <MenuItem icon="heart-outline" label="Favoritos" onPress={() => {}} />
          </View>
        </View>

        {/* Sección Preferencias */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>PREFERENCIAS</Text>
          <View style={styles.card}>
            <MenuItem
              icon="notifications-outline"
              label="Notificaciones"
              rightElement={
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                  color={colors.primary}
                />
              }
            />
            <Divider style={styles.divider} />
            <MenuItem
              icon="moon-outline"
              label="Modo oscuro"
              rightElement={
                <Switch
                  value={darkModeEnabled}
                  onValueChange={setDarkModeEnabled}
                  color={colors.primary}
                />
              }
            />
            <Divider style={styles.divider} />
            <MenuItem icon="language-outline" label="Idioma" onPress={() => {}} />
          </View>
        </View>

        {/* Sección Soporte */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>SOPORTE</Text>
          <View style={styles.card}>
            <MenuItem icon="help-circle-outline" label="Centro de ayuda" onPress={() => {}} />
            <Divider style={styles.divider} />
            <MenuItem icon="shield-outline" label="Política de privacidad" onPress={() => {}} />
            <Divider style={styles.divider} />
            <MenuItem icon="star-outline" label="Calificar la app" onPress={() => {}} />
          </View>
        </View>

        {/* Cerrar sesión */}
        <Button
          id="profile-logout-btn"
          mode="outlined"
          onPress={handleLogout}
          style={styles.logoutBtn}
          contentStyle={styles.logoutBtnContent}
          labelStyle={styles.logoutBtnLabel}
          icon="logout"
          textColor={colors.error}
        >
          Cerrar sesión
        </Button>

        <Text style={styles.version}>Turismo App v1.0.0</Text>
        <View style={{ height: spacing['2xl'] }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    backgroundColor: colors.primary,
    paddingTop: 60,
    paddingBottom: spacing['2xl'],
    alignItems: 'center',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  avatarText: { fontSize: typography.fontSize['3xl'], fontWeight: '700', color: colors.white },
  userName: { fontSize: typography.fontSize.xl, fontWeight: '700', color: colors.white },
  userEmail: { fontSize: typography.fontSize.sm, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  statsBadge: {
    marginTop: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
  },
  statsText: { color: colors.white, fontSize: typography.fontSize.sm, fontWeight: '600' },
  content: { flex: 1, padding: spacing.lg },
  section: { marginBottom: spacing.lg },
  sectionLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: '700',
    color: colors.textLight,
    letterSpacing: 1.2,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  menuIcon: {
    width: 38,
    height: 38,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: { fontSize: typography.fontSize.base, fontWeight: '500' },
  divider: { backgroundColor: colors.border, marginHorizontal: spacing.md },
  logoutBtn: {
    borderRadius: borderRadius.lg,
    borderColor: colors.error,
    marginBottom: spacing.md,
  },
  logoutBtnContent: { height: 50 },
  logoutBtnLabel: { fontSize: typography.fontSize.base, fontWeight: '600' },
  version: { textAlign: 'center', fontSize: typography.fontSize.xs, color: colors.textLight },
});
