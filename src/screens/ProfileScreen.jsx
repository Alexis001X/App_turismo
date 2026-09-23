// ============================================================
// ProfileScreen – Perfil del usuario + Panel de Mis Reservas
// ============================================================

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  FlatList,
} from 'react-native';
import { Text, Divider, Button, Switch, ActivityIndicator } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { logoutUser } from '../firebase/auth';
import { useAuth } from '../hooks/useAuth';
import { getReservacionesByUser } from '../firebase/firestore';
import { colors, spacing, typography, borderRadius, shadows } from '../theme/theme';

// ─── Mapa de colores según estado ─────────────────────────
const ESTADO_CONFIG = {
  pendiente:  { color: '#F59E0B', bg: '#FEF3C7', label: '⏳ Pendiente' },
  confirmada: { color: '#10B981', bg: '#D1FAE5', label: '✅ Confirmada' },
  cancelada:  { color: '#EF4444', bg: '#FEE2E2', label: '❌ Cancelada' },
};

export default function ProfileScreen({ navigation }) {
  const { user } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);

  // ── Estado de reservas ─────────────────────────────────
  const [reservas, setReservas] = useState([]);
  const [loadingReservas, setLoadingReservas] = useState(false);
  const [showReservas, setShowReservas] = useState(false);

  const firstName = user?.displayName?.split(' ')[0] || 'Viajero';
  const avatarLetter = firstName.charAt(0).toUpperCase();

  // ── Cargar reservas ────────────────────────────────────
  const fetchReservas = useCallback(async () => {
    if (!user?.uid) return;
    setLoadingReservas(true);
    try {
      const data = await getReservacionesByUser(user.uid);
      setReservas(data);
    } catch (e) {
      Alert.alert('Error', 'No se pudieron cargar las reservas.');
    } finally {
      setLoadingReservas(false);
    }
  }, [user?.uid]);

  const handleToggleReservas = () => {
    if (!showReservas) {
      fetchReservas();
    }
    setShowReservas((prev) => !prev);
  };

  // ── Logout ─────────────────────────────────────────────
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

  // ── Subcomponente MenuItem ─────────────────────────────
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

  // ── Ticket de reserva ──────────────────────────────────
  const ReservaTicket = ({ item }) => {
    const estado = ESTADO_CONFIG[item.estado] || ESTADO_CONFIG.pendiente;
    return (
      <View style={styles.ticket}>
        {/* Cabecera del ticket */}
        <View style={styles.ticketHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.ticketDestino} numberOfLines={1}>
              🌍 {item.lugarNombre || 'Destino no especificado'}
            </Text>
            {item.hotelNombre ? (
              <Text style={styles.ticketHotel} numberOfLines={1}>
                🏨 {item.hotelNombre}
              </Text>
            ) : null}
          </View>
          <View style={[styles.estadoBadge, { backgroundColor: estado.bg }]}>
            <Text style={[styles.estadoText, { color: estado.color }]}>
              {estado.label}
            </Text>
          </View>
        </View>

        <Divider style={styles.ticketDivider} />

        {/* Detalles del ticket */}
        <View style={styles.ticketBody}>
          <View style={styles.ticketRow}>
            <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.ticketDetail}>
              {item.fechaEntrada || '—'} → {item.fechaSalida || '—'}
            </Text>
          </View>
          <View style={styles.ticketRow}>
            <Ionicons name="people-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.ticketDetail}>
              {item.viajeros ?? 1} viajero{(item.viajeros ?? 1) !== 1 ? 's' : ''}
            </Text>
          </View>
          {item.precio != null && (
            <View style={styles.ticketRow}>
              <Ionicons name="cash-outline" size={14} color={colors.textSecondary} />
              <Text style={styles.ticketDetail}>${item.precio} USD total</Text>
            </View>
          )}
          {item.notas ? (
            <View style={styles.ticketRow}>
              <Ionicons name="reader-outline" size={14} color={colors.textSecondary} />
              <Text style={styles.ticketDetail} numberOfLines={2}>{item.notas}</Text>
            </View>
          ) : null}
        </View>

        {/* Código único */}
        <View style={styles.ticketFooter}>
          <Text style={styles.ticketCode}>🎫 {item.codigoUnico}</Text>
        </View>
      </View>
    );
  };

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

        {/* ── Sección Cuenta ──────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>MI CUENTA</Text>
          <View style={styles.card}>
            <MenuItem icon="person-outline" label="Editar perfil" onPress={() => {}} />
            <Divider style={styles.divider} />

            {/* Mis Reservas — expansible */}
            <MenuItem
              icon="calendar-outline"
              label="Mis reservas"
              onPress={handleToggleReservas}
              rightElement={
                <Ionicons
                  name={showReservas ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color={colors.textLight}
                />
              }
            />

            {/* Panel de reservas expandido */}
            {showReservas && (
              <View style={styles.reservasPanel}>
                {loadingReservas ? (
                  <ActivityIndicator
                    color={colors.primary}
                    style={{ marginVertical: spacing.lg }}
                  />
                ) : reservas.length === 0 ? (
                  <View style={styles.emptyReservas}>
                    <Text style={styles.emptyReservasIcon}>🎒</Text>
                    <Text style={styles.emptyReservasText}>
                      Aún no tienes reservas.{'\n'}¡Explora destinos y reserva tu próximo viaje!
                    </Text>
                    <Button
                      id="profile-explore-btn"
                      mode="contained"
                      compact
                      buttonColor={colors.primary}
                      onPress={() => navigation.navigate('Explore')}
                      style={{ marginTop: spacing.md, borderRadius: borderRadius.md }}
                    >
                      Explorar destinos
                    </Button>
                  </View>
                ) : (
                  <>
                    <Text style={styles.reservasCount}>
                      {reservas.length} reserva{reservas.length !== 1 ? 's' : ''} encontrada{reservas.length !== 1 ? 's' : ''}
                    </Text>
                    {reservas.map((item) => (
                      <ReservaTicket key={item.id} item={item} />
                    ))}
                  </>
                )}
              </View>
            )}

            <Divider style={styles.divider} />
            <MenuItem icon="heart-outline" label="Favoritos" onPress={() => {}} />
          </View>
        </View>

        {/* ── Sección Preferencias ────────────────────────── */}
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

        {/* ── Sección Soporte ─────────────────────────────── */}
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

  // Header
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

  // Content
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

  // MenuItem
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

  // Panel de reservas
  reservasPanel: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    backgroundColor: colors.background,
  },
  reservasCount: {
    fontSize: typography.fontSize.xs,
    color: colors.textLight,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },

  // Empty state
  emptyReservas: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyReservasIcon: { fontSize: 48, marginBottom: spacing.sm },
  emptyReservasText: {
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    lineHeight: 20,
  },

  // Ticket de reserva
  ticket: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    overflow: 'hidden',
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    ...shadows.sm,
  },
  ticketHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.md,
    gap: spacing.sm,
  },
  ticketDestino: {
    fontSize: typography.fontSize.base,
    fontWeight: '700',
    color: colors.text,
  },
  ticketHotel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  estadoBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  estadoText: { fontSize: typography.fontSize.xs, fontWeight: '700' },
  ticketDivider: {
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
  },
  ticketBody: {
    padding: spacing.md,
    gap: spacing.xs,
  },
  ticketRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  ticketDetail: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    flex: 1,
  },
  ticketFooter: {
    backgroundColor: colors.background,
    padding: spacing.sm,
    paddingHorizontal: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    borderStyle: 'dashed',
  },
  ticketCode: {
    fontSize: typography.fontSize.xs,
    color: colors.textLight,
    fontFamily: 'monospace',
    letterSpacing: 1,
  },

  // Logout
  logoutBtn: {
    borderRadius: borderRadius.lg,
    borderColor: colors.error,
    marginBottom: spacing.md,
  },
  logoutBtnContent: { height: 50 },
  logoutBtnLabel: { fontSize: typography.fontSize.base, fontWeight: '600' },
  version: { textAlign: 'center', fontSize: typography.fontSize.xs, color: colors.textLight },
});
