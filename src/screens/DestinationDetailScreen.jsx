// ============================================================
// DestinationDetailScreen – Detalle de un destino turístico
// ============================================================

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { Text, Button, Chip, Divider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { getDestinationReviews } from '../firebase/firestore';
import { colors, spacing, typography, borderRadius, shadows } from '../theme/theme';

export default function DestinationDetailScreen({ route, navigation }) {
  const { destination } = route.params;
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const data = await getDestinationReviews(destination.id);
        setReviews(data);
      } catch (err) {
        console.error('Error cargando reseñas:', err);
      } finally {
        setLoadingReviews(false);
      }
    };
    fetchReviews();
  }, [destination.id]);

  const handleBook = () => {
    navigation.navigate('Booking', { destination });
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View style={styles.heroContainer}>
          {destination.imageUrl ? (
            <Image source={{ uri: destination.imageUrl }} style={styles.heroImage} />
          ) : (
            <View style={styles.heroPlaceholder}>
              <Text style={styles.heroEmoji}>🏝️</Text>
            </View>
          )}

          {/* Overlay de navegación */}
          <View style={styles.heroOverlay}>
            <TouchableOpacity
              id="detail-back-btn"
              style={styles.backBtn}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={22} color={colors.white} />
            </TouchableOpacity>
            <TouchableOpacity
              id="detail-favorite-btn"
              style={styles.favoriteBtn}
              onPress={() => setIsFavorite(!isFavorite)}
            >
              <Ionicons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={22}
                color={isFavorite ? '#EF4444' : colors.white}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Contenido */}
        <View style={styles.content}>
          {/* Nombre y ubicación */}
          <View style={styles.titleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.destinationName}>{destination.name || 'Sin nombre'}</Text>
              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={16} color={colors.primary} />
                <Text style={styles.locationText}>{destination.country || 'Desconocido'}</Text>
              </View>
            </View>
            {destination.rating && (
              <View style={styles.ratingBadge}>
                <Text style={styles.ratingText}>⭐ {destination.rating}</Text>
              </View>
            )}
          </View>

          {/* Chips de características */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
            {destination.category && (
              <Chip style={styles.chip} textStyle={styles.chipText}>{destination.category}</Chip>
            )}
            {destination.duration && (
              <Chip style={styles.chip} textStyle={styles.chipText}>🗓 {destination.duration}</Chip>
            )}
            {destination.difficulty && (
              <Chip style={styles.chip} textStyle={styles.chipText}>🎯 {destination.difficulty}</Chip>
            )}
          </ScrollView>

          <Divider style={styles.divider} />

          {/* Descripción */}
          <Text style={styles.sectionTitle}>Descripción</Text>
          <Text style={styles.description}>
            {destination.description || 'Sin descripción disponible para este destino.'}
          </Text>

          <Divider style={styles.divider} />

          {/* Precio */}
          {destination.price && (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Precio desde</Text>
              <Text style={styles.priceValue}>${destination.price} USD</Text>
            </View>
          )}

          {/* Reseñas */}
          <Text style={styles.sectionTitle}>
            Reseñas {reviews.length > 0 ? `(${reviews.length})` : ''}
          </Text>
          {reviews.length === 0 ? (
            <Text style={styles.noReviews}>Aún no hay reseñas para este destino.</Text>
          ) : (
            reviews.slice(0, 3).map((review) => (
              <View key={review.id} style={styles.reviewCard}>
                <Text style={styles.reviewAuthor}>{review.authorName || 'Anónimo'}</Text>
                <Text style={styles.reviewText}>{review.text}</Text>
                <Text style={styles.reviewRating}>{'⭐'.repeat(review.rating || 5)}</Text>
              </View>
            ))
          )}

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* Botón de reserva flotante */}
      <View style={styles.bottomBar}>
        <Button
          id="detail-book-btn"
          mode="contained"
          onPress={handleBook}
          style={styles.bookBtn}
          contentStyle={styles.bookBtnContent}
          labelStyle={styles.bookBtnLabel}
          icon="calendar-check"
        >
          Reservar ahora
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  heroContainer: { height: 300, position: 'relative' },
  heroImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  heroPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroEmoji: { fontSize: 64 },
  heroOverlay: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { padding: spacing.lg },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.md },
  destinationName: { fontSize: typography.fontSize['2xl'], fontWeight: '700', color: colors.text },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.xs },
  locationText: { color: colors.primary, fontSize: typography.fontSize.sm, marginLeft: 4, fontWeight: '600' },
  ratingBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: borderRadius.md,
  },
  ratingText: { fontSize: typography.fontSize.base, fontWeight: '700', color: '#92400E' },
  chipsRow: { marginBottom: spacing.md },
  chip: { marginRight: spacing.sm, backgroundColor: colors.surfaceVariant },
  chipText: { fontSize: typography.fontSize.sm, color: colors.text },
  divider: { marginVertical: spacing.md, backgroundColor: colors.border },
  sectionTitle: { fontSize: typography.fontSize.xl, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  description: { fontSize: typography.fontSize.base, color: colors.textSecondary, lineHeight: 24 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  priceLabel: { fontSize: typography.fontSize.base, color: colors.textSecondary },
  priceValue: { fontSize: typography.fontSize['2xl'], fontWeight: '700', color: colors.primary },
  noReviews: { color: colors.textLight, fontSize: typography.fontSize.base, fontStyle: 'italic' },
  reviewCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  reviewAuthor: { fontWeight: '700', color: colors.text, marginBottom: 4 },
  reviewText: { color: colors.textSecondary, fontSize: typography.fontSize.sm, marginBottom: 4 },
  reviewRating: { fontSize: 12 },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    padding: spacing.md,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    ...shadows.lg,
  },
  bookBtn: { borderRadius: borderRadius.lg, backgroundColor: colors.primary },
  bookBtnContent: { height: 52 },
  bookBtnLabel: { fontSize: typography.fontSize.lg, fontWeight: '600' },
});
