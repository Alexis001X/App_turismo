
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
  Modal,
  Image,
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
import * as ImagePicker from 'expo-image-picker';
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
import { uploadImageFromUri } from '../firebase/storage';
import { colors, spacing, typography, borderRadius, shadows } from '../theme/theme';
const TABS = ['Destinos', 'Hospedajes'];
const EMPTY_DESTINO = {
  nombre: '', descripcion: '', fotosArray: [],
  contacto: '', categoria: '', pais: '',
  precio: '', duracion: '', rating: '',
};
const EMPTY_HOSPEDAJE = {
  nombre: '', lugarId: '', lugar: '',
  precio: '', imagenesArray: [],
  descripcion: '', estrellas: '',
};
const formatDate = (date) => {
  const d = date.getDate().toString().padStart(2, '0');
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
};

export default function AdminPanelScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('Destinos');
  const [destinos, setDestinos] = useState([]);
  const [loadingDestinos, setLoadingDestinos] = useState(true);
  const [destinoForm, setDestinoForm] = useState(EMPTY_DESTINO);
  const [editingDestinoId, setEditingDestinoId] = useState(null);
  const [savingDestino, setSavingDestino] = useState(false);
  const [showDestinoForm, setShowDestinoForm] = useState(false);
  const [uploadingDestinoImg, setUploadingDestinoImg] = useState(false);
  const [hospedajes, setHospedajes] = useState([]);
  const [loadingHospedajes, setLoadingHospedajes] = useState(true);
  const [hospedajeForm, setHospedajeForm] = useState(EMPTY_HOSPEDAJE);
  const [editingHospedajeId, setEditingHospedajeId] = useState(null);
  const [savingHospedaje, setSavingHospedaje] = useState(false);
  const [showHospedajeForm, setShowHospedajeForm] = useState(false);
  const [uploadingHospedajeImg, setUploadingHospedajeImg] = useState(false);
  const [showDestinosPicker, setShowDestinosPicker] = useState(false);
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

  const pickAndUploadImage = async (folder, onSuccess, onUploading) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permiso requerido',
        'Se necesita acceso a la galería.\nVe a Configuración → Apps → Expo Go → Permisos y activa Fotos.'
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });
    if (result.canceled) return;

    const uri = result.assets[0].uri;
    if (onUploading) onUploading(true);
    try {
      const url = await uploadImageFromUri(uri, folder, (progress) => {
        console.log(`Subiendo: ${progress}%`);
      });
      onSuccess(url);
    } catch (e) {
      Alert.alert(
        'Error al subir imagen',
        e.message || 'No se pudo completar la subida. Verifica tu conexión e intenta de nuevo.'
      );
    } finally {
      if (onUploading) onUploading(false);
    }
  };

  const handleOpenDestinoForm = (item = null) => {
    if (item) {
      setDestinoForm({
        nombre:      item.nombre      || item.name        || '',
        descripcion: item.descripcion || item.description || '',
        fotosArray:  Array.isArray(item.fotos) ? item.fotos : [],
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
        fotos:       destinoForm.fotosArray.filter(Boolean),   // ← array de URLs
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

  const handleOpenHospedajeForm = (item = null) => {
    if (item) {
      setHospedajeForm({
        nombre:        item.nombre      || '',
        lugarId:       item.lugarId     || '',
        lugar:         item.lugar       || '',
        precio:        item.precio      != null ? String(item.precio) : '',
        imagenesArray: Array.isArray(item.imagenes) ? item.imagenes : [],
        descripcion:   item.descripcion || '',
        estrellas:     item.estrellas   != null ? String(item.estrellas) : '',
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
        lugar:       hospedajeForm.lugar.trim(),   // nombre del destino
        precio:      hospedajeForm.precio ? parseFloat(hospedajeForm.precio) : null,
        imagenes:    hospedajeForm.imagenesArray.filter(Boolean),  // ← array de URLs
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

  
  const ImageManager = ({ images, onAdd, onRemove, uploading, folder }) => (
    <View style={styles.imageManagerContainer}>
      <Text style={styles.imageManagerLabel}>
        <Ionicons name="images-outline" size={14} color={colors.textSecondary} />
        {'  '}Fotos / Imágenes
      </Text>
      <View style={styles.imageGrid}>
        {images.map((url, idx) => (
          <View key={idx} style={styles.imageThumbWrap}>
            <Image source={{ uri: url }} style={styles.imageThumb} />
            <TouchableOpacity
              style={styles.imageRemoveBtn}
              onPress={() => onRemove(idx)}
            >
              <Ionicons name="close-circle" size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>
        ))}
        {}
        <TouchableOpacity
          style={styles.imageAddBtn}
          onPress={async () => {
            if (uploading) return;
            onAdd();
          }}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator color={colors.primary} size={24} />
          ) : (
            <>
              <Ionicons name="camera-outline" size={28} color={colors.primary} />
              <Text style={styles.imageAddText}>Agregar</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  
  const DestinoPickerModal = () => (
    <Modal
      visible={showDestinosPicker}
      transparent
      animationType="slide"
      onRequestClose={() => setShowDestinosPicker(false)}
    >
      <View style={styles.pickerOverlay}>
        <View style={styles.pickerModal}>
          <View style={styles.pickerHeader}>
            <Text style={styles.pickerTitle}>Seleccionar destino</Text>
            <TouchableOpacity onPress={() => setShowDestinosPicker(false)}>
              <Ionicons name="close-circle" size={26} color={colors.textLight} />
            </TouchableOpacity>
          </View>
          <Divider />
          {loadingDestinos ? (
            <ActivityIndicator color={colors.primary} style={{ margin: spacing.xl }} />
          ) : (
            <FlatList
              data={destinos}
              keyExtractor={(item) => item.id}
              style={{ maxHeight: 380 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.pickerItem,
                    hospedajeForm.lugarId === item.id && styles.pickerItemSelected,
                  ]}
                  onPress={() => {
                    setHospedajeForm((p) => ({
                      ...p,
                      lugar:   item.nombre || item.name || '',
                      lugarId: item.id,
                    }));
                    setShowDestinosPicker(false);
                  }}
                >
                  <Ionicons name="location-outline" size={18} color={colors.primary} />
                  <View style={{ marginLeft: spacing.sm, flex: 1 }}>
                    <Text style={styles.pickerItemTitle} numberOfLines={1}>
                      {item.nombre || item.name}
                    </Text>
                    <Text style={styles.pickerItemSub} numberOfLines={1}>
                      {item.categoria || item.category} · {item.pais || item.country}
                    </Text>
                  </View>
                  {hospedajeForm.lugarId === item.id && (
                    <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <Divider />}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No hay destinos registrados.</Text>
              }
            />
          )}
        </View>
      </View>
    </Modal>
  );

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

        {}
        {[
          { field: 'nombre',    label: 'Nombre del destino *', icon: 'map-marker-outline' },
          { field: 'pais',      label: 'País',                 icon: 'flag-outline' },
          { field: 'categoria', label: 'Categoría',            icon: 'tag-outline' },
          { field: 'contacto',  label: 'Contacto',             icon: 'phone-outline' },
        ].map(({ field, label, icon }) => (
          <TextInput
            key={field}
            id={`admin-destino-${field}`}
            label={label}
            value={destinoForm[field]}
            onChangeText={(v) => setDestinoForm((p) => ({ ...p, [field]: v }))}
            mode="outlined"
            style={styles.input}
            outlineColor={colors.border}
            activeOutlineColor={colors.primary}
            left={<TextInput.Icon icon={icon} color={colors.textSecondary} />}
          />
        ))}

        <TextInput
          id="admin-destino-duracion"
          label="Duración (ej: 3 días, 1 semana)"
          value={destinoForm.duracion}
          onChangeText={(v) => setDestinoForm((p) => ({ ...p, duracion: v }))}
          mode="outlined"
          style={styles.input}
          outlineColor={colors.border}
          activeOutlineColor={colors.primary}
          left={<TextInput.Icon icon="clock-outline" color={colors.textSecondary} />}
        />

        <TextInput
          id="admin-destino-precio"
          label="Precio (USD)"
          value={destinoForm.precio}
          onChangeText={(v) => setDestinoForm((p) => ({ ...p, precio: v }))}
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
          onChangeText={(v) => setDestinoForm((p) => ({ ...p, rating: v }))}
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
          onChangeText={(v) => setDestinoForm((p) => ({ ...p, descripcion: v }))}
          mode="outlined"
          multiline
          numberOfLines={4}
          style={styles.inputMultiline}
          outlineColor={colors.border}
          activeOutlineColor={colors.primary}
        />

        {}
        <ImageManager
          images={destinoForm.fotosArray}
          uploading={uploadingDestinoImg}
          folder="destinos"
          onAdd={() =>
            pickAndUploadImage(
              'destinos',
              (url) => setDestinoForm((p) => ({ ...p, fotosArray: [...p.fotosArray, url] })),
              setUploadingDestinoImg
            )
          }
          onRemove={(idx) =>
            setDestinoForm((p) => ({
              ...p,
              fotosArray: p.fotosArray.filter((_, i) => i !== idx),
            }))
          }
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

        {}
        <TextInput
          id="admin-hospedaje-nombre"
          label="Nombre del hospedaje *"
          value={hospedajeForm.nombre}
          onChangeText={(v) => setHospedajeForm((p) => ({ ...p, nombre: v }))}
          mode="outlined"
          style={styles.input}
          outlineColor={colors.border}
          activeOutlineColor={colors.primary}
          left={<TextInput.Icon icon="bed-outline" color={colors.textSecondary} />}
        />

        {}
        <TouchableOpacity
          id="admin-hospedaje-lugar-picker"
          style={styles.comboField}
          onPress={() => setShowDestinosPicker(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="location-outline" size={20} color={colors.textSecondary} style={{ marginRight: 8 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.comboFieldLabel}>Destino vinculado *</Text>
            <Text style={[styles.comboFieldValue, !hospedajeForm.lugar && { color: colors.textLight }]}>
              {hospedajeForm.lugar || 'Seleccionar destino…'}
            </Text>
          </View>
          <Ionicons name="chevron-down" size={16} color={colors.textLight} />
        </TouchableOpacity>

        <TextInput
          id="admin-hospedaje-precio"
          label="Precio por noche (USD)"
          value={hospedajeForm.precio}
          onChangeText={(v) => setHospedajeForm((p) => ({ ...p, precio: v }))}
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
          onChangeText={(v) => setHospedajeForm((p) => ({ ...p, estrellas: v }))}
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
          onChangeText={(v) => setHospedajeForm((p) => ({ ...p, descripcion: v }))}
          mode="outlined"
          multiline
          numberOfLines={4}
          style={styles.inputMultiline}
          outlineColor={colors.border}
          activeOutlineColor={colors.primary}
        />

        {}
        <ImageManager
          images={hospedajeForm.imagenesArray}
          uploading={uploadingHospedajeImg}
          folder="hospedajes"
          onAdd={() =>
            pickAndUploadImage(
              'hospedajes',
              (url) => setHospedajeForm((p) => ({ ...p, imagenesArray: [...p.imagenesArray, url] })),
              setUploadingHospedajeImg
            )
          }
          onRemove={(idx) =>
            setHospedajeForm((p) => ({
              ...p,
              imagenesArray: p.imagenesArray.filter((_, i) => i !== idx),
            }))
          }
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

      {}
      <DestinoPickerModal />
    </KeyboardAvoidingView>
  );

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

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {}
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

      {}
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

      {}
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
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
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
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: colors.background,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: typography.fontSize.lg, fontWeight: '700', color: colors.text },
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  tab: {
    flex: 1, paddingVertical: spacing.sm, alignItems: 'center',
    borderBottomWidth: 2, borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: colors.primary },
  tabLabel: { fontSize: typography.fontSize.sm, fontWeight: '600', color: colors.textLight },
  tabLabelActive: { color: colors.primary },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    margin: spacing.lg, backgroundColor: colors.primary,
    paddingVertical: spacing.md, paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg, ...shadows.sm,
  },
  addBtnText: { color: colors.white, fontWeight: '700', fontSize: typography.fontSize.base },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing['2xl'] },
  listItem: {
    flexDirection: 'row', backgroundColor: colors.white,
    borderRadius: borderRadius.md, padding: spacing.md,
    alignItems: 'center', ...shadows.sm,
  },
  listItemInfo: { flex: 1, marginRight: spacing.sm },
  listItemTitle: { fontSize: typography.fontSize.base, fontWeight: '700', color: colors.text },
  listItemSub: { fontSize: typography.fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  listItemPrice: { fontSize: typography.fontSize.sm, fontWeight: '600', color: colors.primary, marginTop: 4 },
  listItemActions: { flexDirection: 'row', gap: spacing.sm },
  actionBtn: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  formScroll: { paddingHorizontal: spacing.lg },
  formHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingVertical: spacing.lg,
  },
  formTitle: { fontSize: typography.fontSize.xl, fontWeight: '700', color: colors.text },
  input: { marginBottom: spacing.md, backgroundColor: colors.white },
  inputMultiline: { marginBottom: spacing.md, backgroundColor: colors.white },
  saveBtn: { borderRadius: borderRadius.lg, marginTop: spacing.sm },
  saveBtnContent: { height: 50 },
  dateField: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: colors.border,
    borderRadius: borderRadius.sm, backgroundColor: colors.white,
    paddingHorizontal: spacing.md, paddingVertical: 14,
    marginBottom: spacing.md,
  },
  dateFieldLabel: {
    fontSize: typography.fontSize.xs, color: colors.textSecondary,
    marginBottom: 2,
  },
  dateFieldValue: { fontSize: typography.fontSize.base, color: colors.text, fontWeight: '500' },
  comboField: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: colors.border,
    borderRadius: borderRadius.sm, backgroundColor: colors.white,
    paddingHorizontal: spacing.md, paddingVertical: 14,
    marginBottom: spacing.md,
  },
  comboFieldLabel: {
    fontSize: typography.fontSize.xs, color: colors.textSecondary, marginBottom: 2,
  },
  comboFieldValue: { fontSize: typography.fontSize.base, color: colors.text, fontWeight: '500' },
  pickerOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  pickerModal: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    paddingBottom: 32, maxHeight: '70%',
  },
  pickerHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', padding: spacing.lg,
  },
  pickerTitle: { fontSize: typography.fontSize.lg, fontWeight: '700', color: colors.text },
  pickerItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
  },
  pickerItemSelected: { backgroundColor: `${colors.primary}10` },
  pickerItemTitle: { fontSize: typography.fontSize.base, fontWeight: '600', color: colors.text },
  pickerItemSub: { fontSize: typography.fontSize.xs, color: colors.textSecondary, marginTop: 2 },
  imageManagerContainer: { marginBottom: spacing.md },
  imageManagerLabel: {
    fontSize: typography.fontSize.sm, color: colors.textSecondary,
    marginBottom: spacing.sm, fontWeight: '600',
  },
  imageGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  imageThumbWrap: { position: 'relative' },
  imageThumb: {
    width: 80, height: 80, borderRadius: borderRadius.sm,
    backgroundColor: colors.border,
  },
  imageRemoveBtn: {
    position: 'absolute', top: -8, right: -8,
    backgroundColor: colors.white, borderRadius: 10,
  },
  imageAddBtn: {
    width: 80, height: 80, borderRadius: borderRadius.sm,
    borderWidth: 2, borderStyle: 'dashed', borderColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: `${colors.primary}08`,
  },
  imageAddText: {
    fontSize: typography.fontSize.xs, color: colors.primary,
    fontWeight: '600', marginTop: 2,
  },

  emptyText: {
    textAlign: 'center', color: colors.textLight,
    marginTop: spacing['2xl'], fontSize: typography.fontSize.base,
  },
});
