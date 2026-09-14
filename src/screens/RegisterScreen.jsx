// ============================================================
// RegisterScreen – Pantalla de registro de usuario
// Campos: nombre, email, cédula, dirección, ciudad, contraseña
// ============================================================

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { Text, TextInput, Button, ActivityIndicator } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { registerUser } from '../firebase/auth';
import { colors, spacing, borderRadius, shadows, typography } from '../theme/theme';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [cedula, setCedula] = useState('');
  const [direccion, setDireccion] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [secureText, setSecureText] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !cedula || !direccion || !ciudad || !password || !confirmPassword) {
      Alert.alert('Campos requeridos', 'Por favor completa todos los campos.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Contraseña débil', 'La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    try {
      setLoading(true);
      await registerUser(email.trim(), password, name.trim(), {
        cedula: cedula.trim(),
        direccion: direccion.trim(),
        ciudad: ciudad.trim(),
      });
    } catch (error) {
      Alert.alert('Error al registrarse', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.emoji}>✈️</Text>
          <Text style={styles.title}>Crea tu cuenta</Text>
          <Text style={styles.subtitle}>Únete y comienza a explorar el mundo</Text>
        </View>

        {/* Formulario */}
        <View style={styles.form}>

          {/* ── Datos personales ── */}
          <Text style={styles.sectionLabel}>DATOS PERSONALES</Text>

          <TextInput
            id="register-name-input"
            label="Nombre completo"
            value={name}
            onChangeText={setName}
            mode="outlined"
            style={styles.input}
            outlineColor={colors.border}
            activeOutlineColor={colors.primary}
            left={<TextInput.Icon icon="account-outline" color={colors.textSecondary} />}
          />

          <TextInput
            id="register-cedula-input"
            label="Cédula de identidad"
            value={cedula}
            onChangeText={setCedula}
            keyboardType="numeric"
            mode="outlined"
            style={styles.input}
            outlineColor={colors.border}
            activeOutlineColor={colors.primary}
            left={<TextInput.Icon icon="card-account-details-outline" color={colors.textSecondary} />}
          />

          <TextInput
            id="register-direccion-input"
            label="Dirección"
            value={direccion}
            onChangeText={setDireccion}
            mode="outlined"
            style={styles.input}
            outlineColor={colors.border}
            activeOutlineColor={colors.primary}
            left={<TextInput.Icon icon="map-marker-outline" color={colors.textSecondary} />}
          />

          <TextInput
            id="register-ciudad-input"
            label="Ciudad"
            value={ciudad}
            onChangeText={setCiudad}
            mode="outlined"
            style={styles.input}
            outlineColor={colors.border}
            activeOutlineColor={colors.primary}
            left={<TextInput.Icon icon="city-variant-outline" color={colors.textSecondary} />}
          />

          {/* ── Acceso ── */}
          <Text style={[styles.sectionLabel, { marginTop: spacing.sm }]}>ACCESO A LA CUENTA</Text>

          <TextInput
            id="register-email-input"
            label="Correo electrónico"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            mode="outlined"
            style={styles.input}
            outlineColor={colors.border}
            activeOutlineColor={colors.primary}
            left={<TextInput.Icon icon="email-outline" color={colors.textSecondary} />}
          />

          <TextInput
            id="register-password-input"
            label="Contraseña"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={secureText}
            mode="outlined"
            style={styles.input}
            outlineColor={colors.border}
            activeOutlineColor={colors.primary}
            left={<TextInput.Icon icon="lock-outline" color={colors.textSecondary} />}
            right={
              <TextInput.Icon
                icon={secureText ? 'eye-outline' : 'eye-off-outline'}
                onPress={() => setSecureText(!secureText)}
                color={colors.textSecondary}
              />
            }
          />

          <TextInput
            id="register-confirm-password-input"
            label="Confirmar contraseña"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={secureText}
            mode="outlined"
            style={styles.input}
            outlineColor={colors.border}
            activeOutlineColor={colors.primary}
            left={<TextInput.Icon icon="lock-check-outline" color={colors.textSecondary} />}
          />

          <Button
            id="register-submit-btn"
            mode="contained"
            onPress={handleRegister}
            disabled={loading}
            style={styles.registerBtn}
            contentStyle={styles.registerBtnContent}
            labelStyle={styles.registerBtnLabel}
          >
            {loading ? <ActivityIndicator color={colors.white} size={20} /> : 'Crear cuenta'}
          </Button>

          <View style={styles.loginRow}>
            <Text style={styles.loginText}>¿Ya tienes cuenta? </Text>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.loginLink}>Inicia sesión</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.secondary },
  scroll: { flexGrow: 1 },
  header: {
    alignItems: 'center',
    paddingTop: spacing['3xl'],
    paddingBottom: spacing['2xl'],
    paddingHorizontal: spacing.lg,
  },
  emoji: { fontSize: 56, marginBottom: spacing.md },
  title: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: '700',
    color: colors.white,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
  },
  form: {
    flex: 1,
    backgroundColor: colors.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: spacing.lg,
    paddingTop: spacing['2xl'],
    ...shadows.lg,
  },
  sectionLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: '700',
    color: colors.textLight,
    letterSpacing: 1.2,
    marginBottom: spacing.md,
    marginLeft: spacing.xs,
  },
  input: { marginBottom: spacing.md, backgroundColor: colors.white },
  registerBtn: {
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  registerBtnContent: { height: 52 },
  registerBtnLabel: { fontSize: typography.fontSize.lg, fontWeight: '600' },
  loginRow: { flexDirection: 'row', justifyContent: 'center' },
  loginText: { color: colors.textSecondary, fontSize: typography.fontSize.base },
  loginLink: { color: colors.primary, fontWeight: '700', fontSize: typography.fontSize.base },
});
