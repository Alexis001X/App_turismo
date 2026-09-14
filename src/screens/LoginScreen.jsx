// ============================================================
// LoginScreen – Pantalla de inicio de sesión
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
import { loginUser } from '../firebase/auth';
import { colors, spacing, borderRadius, shadows, typography } from '../theme/theme';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureText, setSecureText] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Campos requeridos', 'Por favor ingresa tu email y contraseña.');
      return;
    }
    try {
      setLoading(true);
      await loginUser(email.trim(), password);
    } catch (error) {
      Alert.alert('Error al iniciar sesión', error.message);
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
          <Text style={styles.emoji}>🌍</Text>
          <Text style={styles.title}>Bienvenido</Text>
          <Text style={styles.subtitle}>Descubre los mejores destinos del mundo</Text>
        </View>

        {/* Formulario */}
        <View style={styles.form}>
          <TextInput
            id="login-email-input"
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
            id="login-password-input"
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

          <TouchableOpacity style={styles.forgotBtn}>
            <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>

          <Button
            id="login-submit-btn"
            mode="contained"
            onPress={handleLogin}
            disabled={loading}
            style={styles.loginBtn}
            contentStyle={styles.loginBtnContent}
            labelStyle={styles.loginBtnLabel}
          >
            {loading ? <ActivityIndicator color={colors.white} size={20} /> : 'Iniciar sesión'}
          </Button>

          <View style={styles.registerRow}>
            <Text style={styles.registerText}>¿No tienes cuenta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerLink}>Regístrate</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primary },
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
    color: 'rgba(255,255,255,0.8)',
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
  input: { marginBottom: spacing.md, backgroundColor: colors.white },
  forgotBtn: { alignSelf: 'flex-end', marginBottom: spacing.lg },
  forgotText: { color: colors.primary, fontSize: typography.fontSize.sm },
  loginBtn: {
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary,
    marginBottom: spacing.lg,
  },
  loginBtnContent: { height: 52 },
  loginBtnLabel: { fontSize: typography.fontSize.lg, fontWeight: '600' },
  registerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.sm },
  registerText: { color: colors.textSecondary, fontSize: typography.fontSize.base },
  registerLink: { color: colors.primary, fontWeight: '700', fontSize: typography.fontSize.base },
});
