// ============================================================
// ExploreScreen – Pantalla de exploración de destinos
// ============================================================

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { getDestinations } from '../firebase/firestore';
import DestinationCard from '../components/DestinationCard';
import SearchBar from '../components/SearchBar';
import CategoryChip from '../components/CategoryChip';
import { colors, spacing, typography } from '../theme/theme';

const CATEGORIES = ['Todos', 'Playa', 'Montaña', 'Ciudad', 'Cultural', 'Aventura', 'Naturaleza'];

export default function ExploreScreen({ navigation }) {
  const [destinations, setDestinations] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getDestinations();
        setDestinations(data);
        setFiltered(data);
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🌐 Explorar</Text>
        <Text style={styles.subtitle}>{filtered.length} destinos disponibles</Text>
      </View>

      {/* Buscador */}
      <View style={styles.searchWrapper}>
        <SearchBar
          id="explore-search-bar"
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Buscar destino o país..."
        />
      </View>

      {/* Categorías */}
      <FlatList
        horizontal
        data={CATEGORIES}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <CategoryChip
            label={item}
            selected={selectedCategory === item}
            onPress={() => setSelectedCategory(item)}
          />
        )}
        contentContainerStyle={styles.categoriesContainer}
        showsHorizontalScrollIndicator={false}
      />

      {/* Lista de destinos */}
      {loading ? (
        <ActivityIndicator color={colors.primary} style={styles.loader} />
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
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🔍</Text>
              <Text style={styles.emptyText}>Sin resultados para "{searchQuery}"</Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingTop: 60,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.white,
  },
  title: { fontSize: typography.fontSize['2xl'], fontWeight: '700', color: colors.text },
  subtitle: { fontSize: typography.fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  searchWrapper: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, backgroundColor: colors.white },
  categoriesContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
    gap: spacing.sm,
  },
  loader: { marginTop: spacing['2xl'] },
  listContent: { padding: spacing.lg },
  emptyState: { alignItems: 'center', paddingVertical: spacing['2xl'] },
  emptyEmoji: { fontSize: 48, marginBottom: spacing.md },
  emptyText: { fontSize: typography.fontSize.base, color: colors.textSecondary, textAlign: 'center' },
});
