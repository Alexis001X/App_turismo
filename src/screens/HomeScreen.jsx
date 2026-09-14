// ============================================================
// HomeScreen – Pantalla principal con destinos destacados
// ============================================================

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Image,
} from 'react-native';
import { Text, Chip, ActivityIndicator } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../hooks/useAuth';
import { getDestinations } from '../firebase/firestore';
import DestinationCard from '../components/DestinationCard';
import SearchBar from '../components/SearchBar';
import CategoryChip from '../components/CategoryChip';
import { colors, spacing, typography, borderRadius, shadows } from '../theme/theme';

const CATEGORIES = ['Todos', 'Playa', 'Montaña', 'Ciudad', 'Cultural', 'Aventura', 'Naturaleza'];

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const [destinations, setDestinations] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');

  const firstName = user?.displayName?.split(' ')[0] || 'Viajero';

  const fetchDestinations = async () => {
    try {
      const data = await getDestinations();
      setDestinations(data);
      setFiltered(data);
    } catch (error) {
      console.error('Error cargando destinos:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchDestinations(); }, []);

  useEffect(() => {
    let result = destinations;
    if (selectedCategory !== 'Todos') {
      result = result.filter((d) => d.category === selectedCategory);
    }
    if (searchQuery) {
      result = result.filter((d) =>
        d.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.country?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFiltered(result);
  }, [selectedCategory, searchQuery, destinations]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDestinations();
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hola, {firstName} 👋</Text>
            <Text style={styles.headerSubtitle}>¿A dónde viajamos hoy?</Text>
          </View>
          <TouchableOpacity
            id="home-profile-btn"
            onPress={() => navigation.navigate('Profile')}
            style={styles.avatarBtn}
          >
            <Text style={styles.avatarText}>{firstName.charAt(0).toUpperCase()}</Text>
          </TouchableOpacity>
        </View>

        {/* Buscador */}
        <View style={styles.searchWrapper}>
          <SearchBar
            id="home-search-bar"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Buscar destinos, países..."
          />
        </View>

        {/* Categorías */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          {CATEGORIES.map((cat) => (
            <CategoryChip
              key={cat}
              label={cat}
              selected={selectedCategory === cat}
              onPress={() => setSelectedCategory(cat)}
            />
          ))}
        </ScrollView>

        {/* Destinos destacados */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🔥 Destinos populares</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Explore')}>
              <Text style={styles.seeAll}>Ver todos</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator color={colors.primary} style={styles.loader} />
          ) : filtered.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🗺️</Text>
              <Text style={styles.emptyText}>No se encontraron destinos</Text>
            </View>
          ) : (
            <FlatList
              data={filtered}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <DestinationCard
                  destination={item}
                  onPress={() => navigation.navigate('DestinationDetail', { destination: item })}
                />
              )}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
            />
          )}
        </View>

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
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  greeting: { fontSize: typography.fontSize['2xl'], fontWeight: '700', color: colors.white },
  headerSubtitle: { fontSize: typography.fontSize.base, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  avatarBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: colors.white, fontWeight: '700', fontSize: typography.fontSize.lg },
  searchWrapper: { paddingHorizontal: spacing.lg, marginTop: -spacing.lg },
  categoriesContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  section: { paddingHorizontal: spacing.lg },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  sectionTitle: { fontSize: typography.fontSize.xl, fontWeight: '700', color: colors.text },
  seeAll: { fontSize: typography.fontSize.sm, color: colors.primary, fontWeight: '600' },
  loader: { marginVertical: spacing['2xl'] },
  emptyState: { alignItems: 'center', paddingVertical: spacing['2xl'] },
  emptyEmoji: { fontSize: 48, marginBottom: spacing.md },
  emptyText: { fontSize: typography.fontSize.base, color: colors.textSecondary },
});
