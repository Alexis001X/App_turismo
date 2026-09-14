// ============================================================
// DestinationCard – Tarjeta de destino turístico
// ============================================================

import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../theme/theme';

export default function DestinationCard({ destination, onPress }) {
  const {
    name = 'Sin nombre',
    country = 'Desconocido',
    category = '',
    price,
    rating,
    imageUrl,
    duration,
  } = destination;

  return (
    <TouchableOpacity
      id={`destination-card-${destination.id}`}
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.92}
    >
      {/* Imagen */}
      <View style={styles.imageContainer}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.image} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.placeholderEmoji}>🏝️</Text>
          </View>
        )}
        {category ? (
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{category}</Text>
          </View>
        ) : null}
      </View>

      {/* Contenido */}
      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={styles.name} numberOfLines={1}>{name}</Text>
          {rating && (
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={14} color="#F59E0B" />
              <Text style={styles.ratingText}>{rating}</Text>
            </View>
          )}
        </View>

        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={14} color={colors.primary} />
          <Text style={styles.locationText} numberOfLines={1}>{country}</Text>
        </View>

        <View style={styles.bottomRow}>
          {duration && (
            <View style={styles.durationRow}>
              <Ionicons name="time-outline" size={13} color={colors.textSecondary} />
              <Text style={styles.durationText}>{duration}</Text>
            </View>
          )}
          {price && (
            <Text style={styles.price}>
              <Text style={styles.priceFrom}>desde </Text>
              ${price} USD
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    flexDirection: 'row',
    ...shadows.md,
  },
  imageContainer: {
    width: 110,
    height: 110,
    position: 'relative',
  },
  image: { width: '100%', height: '100%', resizeMode: 'cover' },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.primaryLight + '30',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderEmoji: { fontSize: 36 },
  categoryBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  categoryText: { color: colors.white, fontSize: 10, fontWeight: '700' },
  content: {
    flex: 1,
    padding: spacing.md,
    justifyContent: 'space-between',
  },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  name: { fontSize: typography.fontSize.lg, fontWeight: '700', color: colors.text, flex: 1 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginLeft: spacing.sm },
  ratingText: { fontSize: typography.fontSize.sm, fontWeight: '600', color: '#92400E' },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  locationText: { fontSize: typography.fontSize.sm, color: colors.primary, fontWeight: '500', flex: 1 },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.xs },
  durationRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  durationText: { fontSize: typography.fontSize.xs, color: colors.textSecondary },
  price: { fontSize: typography.fontSize.base, fontWeight: '700', color: colors.primary },
  priceFrom: { fontSize: typography.fontSize.xs, fontWeight: '400', color: colors.textSecondary },
});
