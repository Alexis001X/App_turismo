// ============================================================
// BookingScreen – Formulario de reserva
// ============================================================

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Text, TextInput, Button, ActivityIndicator } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { createBooking } from '../firebase/firestore';
import { useAuth } from '../hooks/useAuth';
import { colors, spacing, typography, borderRadius, shadows } from '../theme/theme';

export default function BookingScreen({ route, navigation }) {
  const { destination } = route.params;
  const { user } = useAuth();

  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [travelers, setTravelers] = useState('1');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleBooking = async () => {
    if (!checkIn || !checkOut || !travelers) {
      Alert.alert('Campos requeridos', 'Por favor completa las fechas y número de viajeros.');
      return;
    }
    try {
      setLoading(true);
      await createBooking({
        destinationId: destination.id,
        destinationName: destination.name,
        userId: user.uid,
        userEmail: user.email,
        checkIn,
        checkOut,
        travelers: parseInt(travelers),
        notes,
        totalPrice: destination.price ? destination.price * parseInt(travelers) : null,
      });
      Alert.alert(
        '¡Reserva confirmada! 🎉',
        `Tu reserva para ${destination.name} ha sido registrada con éxito.`,
        [{ text: 'OK', onPress: () => navigation.navigate('Home') }]
      );
    } catch (error) {
      Alert.alert('Error', 'No se pudo completar la reserva. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="light" />
      <View style={styles.header}>
        <TouchableOpacity id="booking-back-btn" onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reservar viaje</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Resumen del destino */}
        <View style={styles.destinationCard}>
          <Text style={styles.destinationEmoji}>🏖️</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.destinationName}>{destination.name}</Text>
            <Text style={styles.destinationCountry}>📍 {destination.country}</Text>
            {destination.price && (
              <Text style={styles.destinationPrice}>${destination.price} USD por persona</Text>
            )}
          </View>
        </View>

        {/* Formulario */}
        <View style={styles.form}>
          <Text style={styles.formTitle}>Detalles de la reserva</Text>

          <TextInput
            id="booking-checkin-input"
            label="Fecha de entrada (DD/MM/AAAA)"
            value={checkIn}
            onChangeText={setCheckIn}
            mode="outlined"
            style={styles.input}
            outlineColor={colors.border}
            activeOutlineColor={colors.primary}
            left={<TextInput.Icon icon="calendar" color={colors.textSecondary} />}
          />

          <TextInput
            id="booking-checkout-input"
            label="Fecha de salida (DD/MM/AAAA)"
            value={checkOut}
            onChangeText={setCheckOut}
            mode="outlined"
            style={styles.input}
            outlineColor={colors.border}
            activeOutlineColor={colors.primary}
            left={<TextInput.Icon icon="calendar-end" color={colors.textSecondary} />}
          />

          <TextInput
            id="booking-travelers-input"
            label="Número de viajeros"
            value={travelers}
            onChangeText={setTravelers}
            keyboardType="number-pad"
            mode="outlined"
            style={styles.input}
            outlineColor={colors.border}
            activeOutlineColor={colors.primary}
            left={<TextInput.Icon icon="account-group-outline" color={colors.textSecondary} />}
          />

          <TextInput
            id="booking-notes-input"
            label="Notas especiales (opcional)"
            value={notes}
            onChangeText={setNotes}
            mode="outlined"
            multiline
            numberOfLines={3}
            style={styles.input}
            outlineColor={colors.border}
            activeOutlineColor={colors.primary}
            left={<TextInput.Icon icon="note-text-outline" color={colors.textSecondary} />}
          />

          {/* Resumen de precio */}
          {destination.price && travelers && (
            <View style={styles.priceSummary}>
              <Text style={styles.priceSummaryLabel}>Total estimado:</Text>
              <Text style={styles.priceSummaryValue}>
                ${destination.price * (parseInt(travelers) || 1)} USD
              </Text>
            </View>
          )}

          <Button
            id="booking-confirm-btn"
            mode="contained"
            onPress={handleBooking}
            disabled={loading}
            style={styles.confirmBtn}
            contentStyle={styles.confirmBtnContent}
            labelStyle={styles.confirmBtnLabel}
            icon="check-circle-outline"
          >
            {loading ? <ActivityIndicator color={colors.white} size={20} /> : 'Confirmar reserva'}
          </Button>
        </View>

        <View style={{ height: spacing['2xl'] }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.primary,
    paddingTop: 60,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: { fontSize: typography.fontSize.lg, fontWeight: '700', color: colors.white },
  container: { flex: 1, backgroundColor: colors.background },
  destinationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    margin: spacing.lg,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.md,
    ...shadows.md,
  },
  destinationEmoji: { fontSize: 40 },
  destinationName: { fontSize: typography.fontSize.lg, fontWeight: '700', color: colors.text },
  destinationCountry: { fontSize: typography.fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  destinationPrice: { fontSize: typography.fontSize.sm, color: colors.primary, fontWeight: '600', marginTop: 4 },
  form: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.lg,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  formTitle: { fontSize: typography.fontSize.xl, fontWeight: '700', color: colors.text, marginBottom: spacing.md },
  input: { marginBottom: spacing.md, backgroundColor: colors.white },
  priceSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surfaceVariant,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
  },
  priceSummaryLabel: { fontSize: typography.fontSize.base, color: colors.textSecondary },
  priceSummaryValue: { fontSize: typography.fontSize.xl, fontWeight: '700', color: colors.primary },
  confirmBtn: { borderRadius: borderRadius.lg, backgroundColor: colors.primary },
  confirmBtnContent: { height: 52 },
  confirmBtnLabel: { fontSize: typography.fontSize.lg, fontWeight: '600' },
});
