// ============================================================
// AdminPanelScreen – Panel CRUD para destinos y hospedajes
// Solo accesible para usuarios con rol 'admin'
// ============================================================

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  FlatList,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  ActivityIndicator,
  Divider,
  Chip,
} from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import {
  getDestinos,
  createDestino,
  updateDestino,
  deleteDestino,
  getHospedajes,
  createHospedaje,
  updateHospedaje,
  deleteHospedaje,
} from '../firebase/firestore';
import { colors, spacing, typography, borderRadius, shadows } from '../theme/theme';

// ─── Tabs ─────────────────────────────────────────────────
const TABS = ['Destinos', 'Hospedajes'];

// ─── Estado inicial de los formularios ────────────────────
const EMPTY_DESTINO = {
  nombre: '', descripcion: '', fotos: '', contacto: '',
  categoria: '', pais: '', precio: '', duracion: '', rating: '',
};
const EMPTY_HOSPEDAJE = {
  nombre: '', lugar: '', precio: '', imagenes: '',
  descripcion: '', estrellas: '',
};

export default function AdminPanelScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('Destinos');

  // ── Estado de Destinos ───────────────────────────────────
  const [destinos, setDestinos] = useState([]);
  const [loadingDestinos, setLoadingDestinos] = useState(true);
  const [destinoForm, setDestinoForm] = useState(EMPTY_DESTINO);
  const [editingDestinoId, setEditingDestinoId] = useState(null);
  const [savingDestino, setSavingDestino] = useState(false);
  const [showDestinoForm, setShowDestinoForm] = useState(false);

  // ── Estado de Hospedajes ─────────────────────────────────
  const [hospedajes, setHospedajes] = useState([]);
  const [loadingHospedajes, setLoadingHospedajes] = useState(true);
  const [hospedajeForm, setHospedajeForm] = useState(EMPTY_HOSPEDAJE);
  const [editingHospedajeId, setEditingHospedajeId] = useState(null);
  const [savingHospedaje, setSavingHospedaje] = useState(false);
  const [showHospedajeForm, setShowHospedajeForm] = useState(false);

  // ── Carga de datos ───────────────────────────────────────
  const fetchDestinos = useCallback(async () => {
    setLoadingDestinos(true);
    try {
      const data = await getDestinos();
      setDestinos(data);
    } catch (e) {
      Alert.alert('Error', 'No se pudieron cargar los destinos.');
    } finally {
      setLoadingDestinos(false);
    }
  }, []);

  const fetchHospedajes = useCallback(async () => {
    setLoadingHospedajes(true);
    try {
      const data = await getHospedajes();
      setHospedajes(data);
    } catch (e) {
      Alert.alert('Error', 'No se pudieron cargar los hospedajes.');
    } finally {
      setLoadingHospedajes(false);
    }
  }, []);

  useEffect(() => { fetchDestinos(); }, [fetchDestinos]);
  useEffect(() => { fetchHospedajes(); }, [fetchHospedajes]);

  // ════════════════════════════════════════════════════════
  // CRUD DESTINOS
  // ════════════════════════════════════════════════════════

  const handleOpenDestinoForm = (item = null) => {
    if (item) {
      setDestinoForm({
        nombre:      item.nombre      || item.name        || '',
        descripcion: item.descripcion || item.description || '',
        fotos:       Array.isArray(item.fotos) ? item.fotos.join('\n') : (item.fotos || ''),
        contacto:    item.contacto    || '',
        categoria:   item.categoria   || item.category    || '',
        pais:        item.pais        || item.country     || '',
        precio:      item.precio      != null ? String(item.precio)  : (item.price != null ? String(item.price) : ''),
        duracion:    item.duracion    || item.duration    || '',
        rating:      item.rating      != null ? String(item.rating)  : '',
      });
      setEditingDestinoId(item.id);
    } else {
      setDestinoForm(EMPTY_DESTINO);
      setEditingDestinoId(null);
    }
    setShowDestinoForm(true);
  };

  const handleSaveDestino = async () => {
    if (!destinoForm.nombre.trim()) {
      Alert.alert('Campo requerido', 'El nombre del destino es obligatorio.');
      return;
    }
    setSavingDestino(true);
    try {
      const payload = {
        nombre:      destinoForm.nombre.trim(),
        descripcion: destinoForm.descripcion.trim(),
        fotos:       destinoForm.fotos.split('\n').map(u => u.trim()).filter(Boolean),
        contacto:    destinoForm.contacto.trim(),
        categoria:   destinoForm.categoria.trim(),
        pais:        destinoForm.pais.trim(),
        precio:      destinoForm.precio ? parseFloat(destinoForm.precio) : null,
        duracion:    destinoForm.duracion.trim(),
        rating:      destinoForm.rating ? parseFloat(destinoForm.rating) : null,
      };
      if (editingDestinoId) {
        await updateDestino(editingDestinoId, payload);
        Alert.alert('✅ Actualizado', `"${payload.nombre}" fue actualizado.`);
      } else {
        await createDestino(payload);
        Alert.alert('✅ Creado', `"${payload.nombre}" fue agregado.`);
      }
      setShowDestinoForm(false);
      fetchDestinos();
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setSavingDestino(false);
    }
  };

  const handleDeleteDestino = (item) => {
    Alert.alert(
      'Eliminar destino',
      `¿Seguro que deseas eliminar "${item.nombre || item.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar', style: 'destructive',
          onPress: async () => {
            try {
              await deleteDestino(item.id);
              fetchDestinos();
            } catch (e) {
              Alert.alert('Error', e.message);
            }
          },
        },
      ]
    );
  };

  // ════════════════════════════════════════════════════════
  // CRUD HOSPEDAJES
  // ════════════════════════════════════════════════════════

  const handleOpenHospedajeForm = (item = null) => {
    if (item) {
      setHospedajeForm({
        nombre:      item.nombre      || '',
        lugar:       item.lugar       || '',
        precio:      item.precio      != null ? String(item.precio) : '',
        imagenes:    Array.isArray(item.imagenes) ? item.imagenes.join('\n') : (item.imagenes || ''),
        descripcion: item.descripcion || '',
        estrellas:   item.estrellas   != null ? String(item.estrellas) : '',
      });
      setEditingHospedajeId(item.id);
    } else {
      setHospedajeForm(EMPTY_HOSPEDAJE);
      setEditingHospedajeId(null);
    }
    setShowHospedajeForm(true);
  };

  const handleSaveHospedaje = async () => {
    if (!hospedajeForm.nombre.trim()) {
      Alert.alert('Campo requerido', 'El nombre del hospedaje es obligatorio.');
      return;
    }
    setSavingHospedaje(true);
    try {
      const payload = {
        nombre:      hospedajeForm.nombre.trim(),
        lugar:       hospedajeForm.lugar.trim(),
        precio:      hospedajeForm.precio ? parseFloat(hospedajeForm.precio) : null,
        imagenes:    hospedajeForm.imagenes.split('\n').map(u => u.trim()).filter(Boolean),
        descripcion: hospedajeForm.descripcion.trim(),
        estrellas:   hospedajeForm.estrellas ? parseInt(hospedajeForm.estrellas) : null,
      };
      if (editingHospedajeId) {
        await updateHospedaje(editingHospedajeId, payload);
        Alert.alert('✅ Actualizado', `"${payload.nombre}" fue actualizado.`);
      } else {
        await createHospedaje(payload);
        Alert.alert('✅ Creado', `"${payload.nombre}" fue agregado.`);
      }
      setShowHospedajeForm(false);
      fetchHospedajes();
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setSavingHospedaje(false);
    }
  };

  const handleDeleteHospedaje = (item) => {
    Alert.alert(
      'Eliminar hospedaje',
      `¿Seguro que deseas eliminar "${item.nombre}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar', style: 'destructive',
          onPress: async () => {
            try {
              await deleteHospedaje(item.id);
              fetchHospedajes();
            } catch (e) {
              Alert.alert('Error', e.message);
            }
          },
        },
      ]
    );
  };

  // ════════════════════════════════════════════════════════
  // RENDER – Formulario Destino
  // ════════════════════════════════════════════════════════

  const renderDestinoForm = () => (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        style={styles.formScroll}
        contentContainerStyle={{ paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formHeader}>
          <Text style={styles.formTitle}>
            {editingDestinoId ? '✏️ Editar destino' : '➕ Nuevo destino'}
          </Text>
          <TouchableOpacity onPress={() => setShowDestinoForm(false)}>
            <Ionicons name="close-circle" size={28} color={colors.textLight} />
          </TouchableOpacity>
        </View>

        {[
          { field: 'nombre',    label: 'Nombre del destino *', icon: 'map-marker-outline' },
          { field: 'pais',      label: 'País',                 icon: 'flag-outline' },
          { field: 'categoria', label: 'Categoría',            icon: 'tag-outline' },
          { field: 'contacto',  label: 'Contacto',             icon: 'phone-outline' },
          { field: 'duracion',  label: 'Duración (ej: 3 días)',icon: 'clock-outline' },
        ].map(({ field, label, icon }) => (
          <TextInput
            key={field}
            id={`admin-destino-${field}`}
            label={label}
            value={destinoForm[field]}
            onChangeText={(v) => setDestinoForm(p => ({ ...p, [field]: v }))}
            mode="outlined"
            style={styles.input}
            outlineColor={colors.border}
            activeOutlineColor={colors.primary}
            left={<TextInput.Icon icon={icon} color={colors.textSecondary} />}
          />
        ))}

        <TextInput
          id="admin-destino-precio"
          label="Precio (USD)"
          value={destinoForm.precio}
          onChangeText={(v) => setDestinoForm(p => ({ ...p, precio: v }))}
          keyboardType="decimal-pad"
          mode="outlined"
          style={styles.input}
          outlineColor={colors.border}
          activeOutlineColor={colors.primary}
          left={<TextInput.Icon icon="cash" color={colors.textSecondary} />}
        />

        <TextInput
          id="admin-destino-rating"
          label="Rating (1.0 – 5.0)"
          value={destinoForm.rating}
          onChangeText={(v) => setDestinoForm(p => ({ ...p, rating: v }))}
          keyboardType="decimal-pad"
          mode="outlined"
          style={styles.input}
          outlineColor={colors.border}
          activeOutlineColor={colors.primary}
          left={<TextInput.Icon icon="star-outline" color={colors.textSecondary} />}
        />

        <TextInput
          id="admin-destino-descripcion"
          label="Descripción"
          value={destinoForm.descripcion}
          onChangeText={(v) => setDestinoForm(p => ({ ...p, descripcion: v }))}
          mode="outlined"
          multiline
          numberOfLines={4}
          style={styles.inputMultiline}
          outlineColor={colors.border}
          activeOutlineColor={colors.primary}
        />

        <TextInput
          id="admin-destino-fotos"
          label="URLs de fotos (una por línea)"
          value={destinoForm.fotos}
          onChangeText={(v) => setDestinoForm(p => ({ ...p, fotos: v }))}
          mode="outlined"
          multiline
          numberOfLines={3}
          style={styles.inputMultiline}
          outlineColor={colors.border}
          activeOutlineColor={colors.primary}
          left={<TextInput.Icon icon="image-outline" color={colors.textSecondary} />}
        />

        <Button
          id="admin-destino-save-btn"
          mode="contained"
          onPress={handleSaveDestino}
          disabled={savingDestino}
          style={styles.saveBtn}
          contentStyle={styles.saveBtnContent}
          buttonColor={colors.primary}
        >
          {savingDestino
            ? <ActivityIndicator color={colors.white} size={18} />
            : (editingDestinoId ? 'Guardar cambios' : 'Crear destino')}
        </Button>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );

  // ════════════════════════════════════════════════════════
  // RENDER – Formulario Hospedaje
  // ════════════════════════════════════════════════════════

  const renderHospedajeForm = () => (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        style={styles.formScroll}
        contentContainerStyle={{ paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formHeader}>
          <Text style={styles.formTitle}>
            {editingHospedajeId ? '✏️ Editar hospedaje' : '➕ Nuevo hospedaje'}
          </Text>
          <TouchableOpacity onPress={() => setShowHospedajeForm(false)}>
            <Ionicons name="close-circle" size={28} color={colors.textLight} />
          </TouchableOpacity>
        </View>

        {[
          { field: 'nombre', label: 'Nombre del hospedaje *', icon: 'bed-outline' },
          { field: 'lugar',  label: 'Lugar / Destino',        icon: 'map-marker-outline' },
        ].map(({ field, label, icon }) => (
          <TextInput
            key={field}
            id={`admin-hospedaje-${field}`}
            label={label}
            value={hospedajeForm[field]}
            onChangeText={(v) => setHospedajeForm(p => ({ ...p, [field]: v }))}
            mode="outlined"
            style={styles.input}
            outlineColor={colors.border}
            activeOutlineColor={colors.primary}
            left={<TextInput.Icon icon={icon} color={colors.textSecondary} />}
          />
        ))}

        <TextInput
          id="admin-hospedaje-precio"
          label="Precio por noche (USD)"
          value={hospedajeForm.precio}
          onChangeText={(v) => setHospedajeForm(p => ({ ...p, precio: v }))}
          keyboardType="decimal-pad"
          mode="outlined"
          style={styles.input}
          outlineColor={colors.border}
          activeOutlineColor={colors.primary}
          left={<TextInput.Icon icon="cash" color={colors.textSecondary} />}
        />

        <TextInput
          id="admin-hospedaje-estrellas"
          label="Estrellas (1 – 5)"
          value={hospedajeForm.estrellas}
          onChangeText={(v) => setHospedajeForm(p => ({ ...p, estrellas: v }))}
          keyboardType="number-pad"
          mode="outlined"
          style={styles.input}
          outlineColor={colors.border}
          activeOutlineColor={colors.primary}
          left={<TextInput.Icon icon="star-outline" color={colors.textSecondary} />}
        />

        <TextInput
          id="admin-hospedaje-descripcion"
          label="Descripción"
          value={hospedajeForm.descripcion}
          onChangeText={(v) => setHospedajeForm(p => ({ ...p, descripcion: v }))}
          mode="outlined"
          multiline
          numberOfLines={4}
          style={styles.inputMultiline}
          outlineColor={colors.border}
          activeOutlineColor={colors.primary}
        />

        <TextInput
          id="admin-hospedaje-imagenes"
          label="URLs de imágenes (una por línea)"
          value={hospedajeForm.imagenes}
          onChangeText={(v) => setHospedajeForm(p => ({ ...p, imagenes: v }))}
          mode="outlined"
          multiline
          numberOfLines={3}
          style={styles.inputMultiline}
          outlineColor={colors.border}
          activeOutlineColor={colors.primary}
          left={<TextInput.Icon icon="image-outline" color={colors.textSecondary} />}
        />

        <Button
          id="admin-hospedaje-save-btn"
          mode="contained"
          onPress={handleSaveHospedaje}
          disabled={savingHospedaje}
          style={styles.saveBtn}
          contentStyle={styles.saveBtnContent}
          buttonColor={colors.primary}
        >
          {savingHospedaje
            ? <ActivityIndicator color={colors.white} size={18} />
            : (editingHospedajeId ? 'Guardar cambios' : 'Crear hospedaje')}
        </Button>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );

  // ════════════════════════════════════════════════════════
  // RENDER – Lista de Destinos
  // ════════════════════════════════════════════════════════

  const renderDestinoItem = ({ item }) => (
    <View style={styles.listItem}>
      <View style={styles.listItemInfo}>
        <Text style={styles.listItemTitle} numberOfLines={1}>
          {item.nombre || item.name || 'Sin nombre'}
        </Text>
        <Text style={styles.listItemSub} numberOfLines={1}>
          {item.categoria || item.category || '—'} · {item.pais || item.country || '—'}
        </Text>
        {(item.precio != null || item.price != null) && (
          <Text style={styles.listItemPrice}>
            ${item.precio ?? item.price} USD
          </Text>
        )}
      </View>
      <View style={styles.listItemActions}>
        <TouchableOpacity
          id={`edit-destino-${item.id}`}
          style={[styles.actionBtn, { backgroundColor: colors.primary + '15' }]}
          onPress={() => handleOpenDestinoForm(item)}
        >
          <Ionicons name="pencil-outline" size={18} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          id={`delete-destino-${item.id}`}
          style={[styles.actionBtn, { backgroundColor: '#FEE2E215' }]}
          onPress={() => handleDeleteDestino(item)}
        >
          <Ionicons name="trash-outline" size={18} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  // ════════════════════════════════════════════════════════
  // RENDER – Lista de Hospedajes
  // ════════════════════════════════════════════════════════

  const renderHospedajeItem = ({ item }) => (
    <View style={styles.listItem}>
      <View style={styles.listItemInfo}>
        <Text style={styles.listItemTitle} numberOfLines={1}>{item.nombre}</Text>
        <Text style={styles.listItemSub} numberOfLines={1}>
          {item.lugar || '—'} · {'⭐'.repeat(item.estrellas || 0) || 'Sin estrellas'}
        </Text>
        {item.precio != null && (
          <Text style={styles.listItemPrice}>${item.precio} / noche</Text>
        )}
      </View>
      <View style={styles.listItemActions}>
        <TouchableOpacity
          id={`edit-hospedaje-${item.id}`}
          style={[styles.actionBtn, { backgroundColor: colors.primary + '15' }]}
          onPress={() => handleOpenHospedajeForm(item)}
        >
          <Ionicons name="pencil-outline" size={18} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          id={`delete-hospedaje-${item.id}`}
          style={[styles.actionBtn, { backgroundColor: '#FEE2E215' }]}
          onPress={() => handleDeleteHospedaje(item)}
        >
          <Ionicons name="trash-outline" size={18} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  // ════════════════════════════════════════════════════════
  // RENDER PRINCIPAL
  // ════════════════════════════════════════════════════════

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          id="admin-back-btn"
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🛠 Panel Administrador</Text>
        <View style={{ width: 38 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabsRow}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            id={`admin-tab-${tab.toLowerCase()}`}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => {
              setActiveTab(tab);
              setShowDestinoForm(false);
              setShowHospedajeForm(false);
            }}
          >
            <Text style={[styles.tabLabel, activeTab === tab && styles.tabLabelActive]}>
              {tab === 'Destinos' ? '🌍 ' : '🏨 '}{tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Divider />

      {/* Contenido */}
      {activeTab === 'Destinos' ? (
        showDestinoForm ? (
          renderDestinoForm()
        ) : (
          <View style={{ flex: 1 }}>
            <TouchableOpacity
              id="admin-add-destino-btn"
              style={styles.addBtn}
              onPress={() => handleOpenDestinoForm()}
            >
              <Ionicons name="add-circle-outline" size={20} color={colors.white} />
              <Text style={styles.addBtnText}>Agregar destino</Text>
            </TouchableOpacity>

            {loadingDestinos ? (
              <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
            ) : (
              <FlatList
                data={destinos}
                keyExtractor={(item) => item.id}
                renderItem={renderDestinoItem}
                contentContainerStyle={styles.list}
                ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>No hay destinos aún.</Text>
                }
              />
            )}
          </View>
        )
      ) : (
        showHospedajeForm ? (
          renderHospedajeForm()
        ) : (
          <View style={{ flex: 1 }}>
            <TouchableOpacity
              id="admin-add-hospedaje-btn"
              style={styles.addBtn}
              onPress={() => handleOpenHospedajeForm()}
            >
              <Ionicons name="add-circle-outline" size={20} color={colors.white} />
              <Text style={styles.addBtnText}>Agregar hospedaje</Text>
            </TouchableOpacity>

            {loadingHospedajes ? (
              <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
            ) : (
              <FlatList
                data={hospedajes}
                keyExtractor={(item) => item.id}
                renderItem={renderHospedajeItem}
                contentContainerStyle={styles.list}
                ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>No hay hospedajes aún.</Text>
                }
              />
            )}
          </View>
        )
      )}
    </View>
  );
}

// ════════════════════════════════════════════════════════
// ESTILOS
// ════════════════════════════════════════════════════════
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 56 : 48,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.white,
    ...shadows.sm,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '700',
    color: colors.text,
  },

  // Tabs
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: colors.primary },
  tabLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    color: colors.textLight,
  },
  tabLabelActive: { color: colors.primary },

  // Botón agregar
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    margin: spacing.lg,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  addBtnText: { color: colors.white, fontWeight: '700', fontSize: typography.fontSize.base },

  // Lista
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing['2xl'] },
  listItem: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    ...shadows.sm,
  },
  listItemInfo: { flex: 1, marginRight: spacing.sm },
  listItemTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: '700',
    color: colors.text,
  },
  listItemSub: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  listItemPrice: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    color: colors.primary,
    marginTop: 4,
  },
  listItemActions: { flexDirection: 'row', gap: spacing.sm },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Formulario
  formScroll: { paddingHorizontal: spacing.lg },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  formTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: '700',
    color: colors.text,
  },
  input: { marginBottom: spacing.md, backgroundColor: colors.white },
  inputMultiline: { marginBottom: spacing.md, backgroundColor: colors.white },
  saveBtn: { borderRadius: borderRadius.lg, marginTop: spacing.sm },
  saveBtnContent: { height: 50 },

  emptyText: {
    textAlign: 'center',
    color: colors.textLight,
    marginTop: spacing['2xl'],
    fontSize: typography.fontSize.base,
  },
});
