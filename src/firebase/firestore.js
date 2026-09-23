// ============================================================
// FIRESTORE – Operaciones de base de datos
// Colecciones: users, destinos, hospedajes, reservaciones
// ============================================================

import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebaseConfig';

// ─── Nombres de colecciones ────────────────────────────────
const COLLECTIONS = {
  USERS: 'users',
  DESTINOS: 'destinos',
  HOSPEDAJES: 'hospedajes',
  RESERVACIONES: 'reservaciones',
};

// ─── Utilidad: generar código único de reserva ─────────────
const generateBookingCode = () => {
  const prefix = 'RES';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

// ═══════════════════════════════════════════════════════════
// USUARIOS
// ═══════════════════════════════════════════════════════════

/** Obtener perfil de usuario */
export const getUserProfile = async (userId) => {
  const docRef = doc(db, COLLECTIONS.USERS, userId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) return { id: docSnap.id, ...docSnap.data() };
  return null;
};

/** Actualizar perfil de usuario */
export const saveUserProfile = async (userId, profileData) => {
  const docRef = doc(db, COLLECTIONS.USERS, userId);
  await updateDoc(docRef, {
    ...profileData,
    updatedAt: serverTimestamp(),
  });
};

/** Obtener todos los usuarios (solo admin) */
export const getAllUsers = async () => {
  const snapshot = await getDocs(collection(db, COLLECTIONS.USERS));
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
};

// ═══════════════════════════════════════════════════════════
// DESTINOS
// ═══════════════════════════════════════════════════════════

/**
 * Mapea campos en español de Firestore → campos en inglés que usa la UI
 * (DestinationCard, DestinationDetailScreen, HomeScreen, ExploreScreen)
 */
const mapDestino = (id, data) => ({
  id,
  // ── Campos en inglés que consume la UI ─────────────────────
  name:        data.nombre        || '',
  description: data.descripcion   || '',
  country:     data.pais          || '',
  category:    data.categoria     || '',
  price:       data.precio        ?? null,
  duration:    data.duracion      || '',
  rating:      data.rating        ?? null,
  imageUrl:    Array.isArray(data.fotos) && data.fotos.length > 0
                 ? data.fotos[0]
                 : (data.imageUrl || null),
  // ── Campos originales en español (para edición/CRUD) ───────
  nombre:      data.nombre        || '',
  descripcion: data.descripcion   || '',
  fotos:       data.fotos         || [],
  contacto:    data.contacto      || '',
  categoria:   data.categoria     || '',
  pais:        data.pais          || '',
  precio:      data.precio        ?? null,
  duracion:    data.duracion      || '',
  createdAt:   data.createdAt,
  updatedAt:   data.updatedAt,
});

/** Obtener todos los destinos turísticos */
export const getDestinos = async () => {
  const q = query(collection(db, COLLECTIONS.DESTINOS), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => mapDestino(d.id, d.data()));
};

/** Obtener un destino por ID */
export const getDestinoById = async (id) => {
  const docRef = doc(db, COLLECTIONS.DESTINOS, id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) return mapDestino(docSnap.id, docSnap.data());
  return null;
};

/** Obtener destinos por categoría */
export const getDestinosByCategoria = async (categoria) => {
  const q = query(
    collection(db, COLLECTIONS.DESTINOS),
    where('categoria', '==', categoria)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => mapDestino(d.id, d.data()));
};

/**
 * Crear nuevo destino (admin)
 * ─── Todos los campos que existen en Firestore deben guardarse aquí ───
 * Estructura real (verificada via MCP 2025-09):
 *   nombre, descripcion, fotos[], contacto, categoria, pais,
 *   precio (number), duracion, rating (number), createdAt, updatedAt
 */
export const createDestino = async (data) => {
  const docRef = await addDoc(collection(db, COLLECTIONS.DESTINOS), {
    nombre:      data.nombre      || '',
    descripcion: data.descripcion || '',
    fotos:       Array.isArray(data.fotos) ? data.fotos : [],
    contacto:    data.contacto    || '',
    categoria:   data.categoria   || '',
    pais:        data.pais        || '',
    precio:      data.precio != null ? Number(data.precio) : null,
    duracion:    data.duracion    || '',
    rating:      data.rating  != null ? Number(data.rating)  : null,
    createdAt:   serverTimestamp(),
    updatedAt:   serverTimestamp(),
  });
  return docRef.id;
};

/** Actualizar destino (admin) */
export const updateDestino = async (id, data) => {
  const docRef = doc(db, COLLECTIONS.DESTINOS, id);
  await updateDoc(docRef, {
    nombre:      data.nombre      || '',
    descripcion: data.descripcion || '',
    fotos:       Array.isArray(data.fotos) ? data.fotos : [],
    contacto:    data.contacto    || '',
    categoria:   data.categoria   || '',
    pais:        data.pais        || '',
    precio:      data.precio != null ? Number(data.precio) : null,
    duracion:    data.duracion    || '',
    rating:      data.rating  != null ? Number(data.rating)  : null,
    updatedAt:   serverTimestamp(),
  });
};

/** Eliminar destino (admin) */
export const deleteDestino = async (id) => {
  await deleteDoc(doc(db, COLLECTIONS.DESTINOS, id));
};

// ═══════════════════════════════════════════════════════════
// HOSPEDAJES
// ═══════════════════════════════════════════════════════════

/**
 * Obtener todos los hospedajes
 * Estructura: { nombre, lugar, precio, imagenes[], descripcion, estrellas, createdAt }
 */
export const getHospedajes = async () => {
  const q = query(collection(db, COLLECTIONS.HOSPEDAJES), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
};

/** Obtener hospedaje por ID */
export const getHospedajeById = async (id) => {
  const docRef = doc(db, COLLECTIONS.HOSPEDAJES, id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) return { id: docSnap.id, ...docSnap.data() };
  return null;
};

/** Obtener hospedajes por lugar/destino */
export const getHospedajesByLugar = async (lugar) => {
  const q = query(
    collection(db, COLLECTIONS.HOSPEDAJES),
    where('lugar', '==', lugar)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
};

/** Crear nuevo hospedaje (admin) */
export const createHospedaje = async (data) => {
  const docRef = await addDoc(collection(db, COLLECTIONS.HOSPEDAJES), {
    nombre:      data.nombre      || '',
    lugar:       data.lugar       || '',
    precio:      data.precio != null ? Number(data.precio) : null,
    imagenes:    Array.isArray(data.imagenes) ? data.imagenes : [],
    descripcion: data.descripcion || '',
    estrellas:   data.estrellas != null ? Number(data.estrellas) : null,
    createdAt:   serverTimestamp(),
    updatedAt:   serverTimestamp(),
  });
  return docRef.id;
};

/** Actualizar hospedaje (admin) */
export const updateHospedaje = async (id, data) => {
  const docRef = doc(db, COLLECTIONS.HOSPEDAJES, id);
  await updateDoc(docRef, {
    nombre:      data.nombre      || '',
    lugar:       data.lugar       || '',
    precio:      data.precio != null ? Number(data.precio) : null,
    imagenes:    Array.isArray(data.imagenes) ? data.imagenes : [],
    descripcion: data.descripcion || '',
    estrellas:   data.estrellas != null ? Number(data.estrellas) : null,
    updatedAt:   serverTimestamp(),
  });
};

/** Eliminar hospedaje (admin) */
export const deleteHospedaje = async (id) => {
  await deleteDoc(doc(db, COLLECTIONS.HOSPEDAJES, id));
};

// ═══════════════════════════════════════════════════════════
// RESERVACIONES
// ═══════════════════════════════════════════════════════════

/**
 * Crear una nueva reservación
 *
 * Estructura en Firestore /reservaciones/{id}:
 *   codigoUnico    string   → generado automáticamente (RES-XXXXX-XXXX)
 *   lugarId        string   → ID del destino
 *   lugarNombre    string   → Nombre del destino
 *   hotelId        string   → ID del hospedaje (opcional)
 *   hotelNombre    string   → Nombre del hospedaje (opcional)
 *   precio         number   → Total USD
 *   userId         string   → UID del usuario autenticado
 *   userEmail      string   → Email del usuario
 *   fechaEntrada   string   → DD/MM/AAAA
 *   fechaSalida    string   → DD/MM/AAAA
 *   viajeros       number   → Número de viajeros
 *   notas          string   → Notas especiales
 *   estado         string   → 'pendiente' | 'confirmada' | 'cancelada'
 *   createdAt      Timestamp
 *   updatedAt      Timestamp
 */
export const createReservacion = async (data) => {
  const codigoUnico = generateBookingCode();
  const docRef = await addDoc(collection(db, COLLECTIONS.RESERVACIONES), {
    codigoUnico,
    lugarId:      data.lugarId      || '',
    lugarNombre:  data.lugarNombre  || '',
    hotelId:      data.hotelId      || '',
    hotelNombre:  data.hotelNombre  || '',
    precio:       data.precio != null ? Number(data.precio) : 0,
    userId:       data.userId       || '',
    userEmail:    data.userEmail    || '',
    fechaEntrada: data.fechaEntrada || '',
    fechaSalida:  data.fechaSalida  || '',
    viajeros:     data.viajeros != null ? Number(data.viajeros) : 1,
    notas:        data.notas        || '',
    estado:       'pendiente',
    createdAt:    serverTimestamp(),
    updatedAt:    serverTimestamp(),
  });
  return { id: docRef.id, codigoUnico };
};

/** Obtener reservaciones del usuario actual (ordenadas por fecha descendente) */
export const getReservacionesByUser = async (userId) => {
  // ⚠️ No usamos orderBy('createdAt') aquí porque combinarlo con where()
  // requiere un índice compuesto en Firestore que puede no existir.
  // Ordenamos en el cliente para evitar el error failed-precondition.
  const q = query(
    collection(db, COLLECTIONS.RESERVACIONES),
    where('userId', '==', userId)
  );
  const snapshot = await getDocs(q);
  const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  // Ordenar por createdAt descendente (más reciente primero)
  return docs.sort((a, b) => {
    const ta = a.createdAt?.toMillis?.() ?? 0;
    const tb = b.createdAt?.toMillis?.() ?? 0;
    return tb - ta;
  });
};

/** Obtener todas las reservaciones (admin) */
export const getAllReservaciones = async () => {
  const q = query(
    collection(db, COLLECTIONS.RESERVACIONES),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
};

/** Actualizar estado de reservación */
export const updateEstadoReservacion = async (id, estado) => {
  const docRef = doc(db, COLLECTIONS.RESERVACIONES, id);
  await updateDoc(docRef, {
    estado,
    updatedAt: serverTimestamp(),
  });
};

/** Cancelar reservación */
export const cancelarReservacion = async (id) => {
  await updateEstadoReservacion(id, 'cancelada');
};

// ═══════════════════════════════════════════════════════════
// PUENTES DE COMPATIBILIDAD (BookingScreen → Firestore)
// ═══════════════════════════════════════════════════════════

/**
 * BookingScreen llama a createBooking con campos en inglés:
 *   { destinationId, destinationName, userId, userEmail,
 *     checkIn, checkOut, travelers, notes, totalPrice }
 *
 * Este puente los mapea a los campos en español de createReservacion.
 */
export const createBooking = async (data) =>
  createReservacion({
    lugarId:      data.destinationId   || '',
    lugarNombre:  data.destinationName || '',
    hotelId:      '',
    hotelNombre:  '',
    precio:       data.totalPrice      ?? 0,
    userId:       data.userId          || '',
    userEmail:    data.userEmail       || '',
    fechaEntrada: data.checkIn         || '',
    fechaSalida:  data.checkOut        || '',
    viajeros:     data.travelers != null ? Number(data.travelers) : 1,
    notas:        data.notes           || '',
  });

/** Alias para obtener reservaciones propias */
export const getUserBookings = getReservacionesByUser;

// ─── Aliases para compatibilidad con pantallas existentes ───
export const getDestinations = getDestinos;
export const getDestinationById = getDestinoById;
export const getDestinationsByCategory = getDestinosByCategoria;

// ─── RESEÑAS (placeholder — sin colección aún) ─────────────
export const getDestinationReviews = async (_destinoId) => [];
