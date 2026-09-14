// ============================================================
// TEMA – React Native Paper + colores de la app
// ============================================================

import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

// Paleta de colores principal
export const colors = {
  primary: '#1A6B5A',       // Verde turquesa profundo
  primaryLight: '#2E9E80',
  primaryDark: '#0F4A3D',
  secondary: '#F4A261',     // Naranja cálido
  secondaryLight: '#F7C49E',
  accent: '#E76F51',        // Coral
  background: '#F8F9FA',
  surface: '#FFFFFF',
  surfaceVariant: '#F0F4F3',
  text: '#1C1C1E',
  textSecondary: '#6B7280',
  textLight: '#9CA3AF',
  border: '#E5E7EB',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(0,0,0,0.5)',

  // Gradientes (arrays para LinearGradient)
  gradientPrimary: ['#1A6B5A', '#2E9E80'],
  gradientHero: ['#0F4A3D', '#1A6B5A', '#2E9E80'],
  gradientCard: ['rgba(0,0,0,0)', 'rgba(0,0,0,0.65)'],
};

// Tipografías
export const typography = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
  },
  fontSize: {
    xs: 11,
    sm: 13,
    base: 15,
    lg: 17,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

// Espaciado
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
};

// Bordes
export const borderRadius = {
  sm: 6,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

// Sombras
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 10,
  },
};

// Tema claro para React Native Paper
export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    primaryContainer: colors.primaryLight,
    secondary: colors.secondary,
    secondaryContainer: colors.secondaryLight,
    background: colors.background,
    surface: colors.surface,
    error: colors.error,
    onPrimary: colors.white,
    onSecondary: colors.white,
    onBackground: colors.text,
    onSurface: colors.text,
  },
};

// Tema oscuro para React Native Paper
export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: colors.primaryLight,
    primaryContainer: colors.primaryDark,
    secondary: colors.secondary,
    background: '#121212',
    surface: '#1E1E1E',
    error: colors.error,
    onPrimary: colors.white,
    onBackground: colors.white,
    onSurface: colors.white,
  },
};
