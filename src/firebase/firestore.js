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
 * Obtener todos los destinos turísticos
 * Estructura: { nombre, descripcion, fotos[], contacto, categoria, createdAt }
 */
export const getDestinos = async () => {
  const q = query(collection(db, COLLECTIONS.DESTINOS), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
};

/** Obtener un destino por ID */
export const getDestinoById = async (id) => {
  const docRef = doc(db, COLLECTIONS.DESTINOS, id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) return { id: docSnap.id, ...docSnap.data() };
  return null;
};

/** Obtener destinos por categoría */
export const getDestinosByCategoria = async (categoria) => {
  const q = query(
    collection(db, COLLECTIONS.DESTINOS),
    where('categoria', '==', categoria)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
};

/** Crear nuevo destino (admin) */
export const createDestino = async (data) => {
  const docRef = await addDoc(collection(db, COLLECTIONS.DESTINOS), {
    nombre: data.nombre || '',
    descripcion: data.descripcion || '',
    fotos: data.fotos || [],           // array de URLs
    contacto: data.contacto || '',
    categoria: data.categoria || '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

/** Actualizar destino (admin) */
export const updateDestino = async (id, data) => {
  const docRef = doc(db, COLLECTIONS.DESTINOS, id);
  await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
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
 * Estructura: { nombre, lugar, precio, imagenes[], descripcion, createdAt }
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
    nombre: data.nombre || '',
    lugar: data.lugar || '',
    precio: data.precio || 0,          // precio por noche en USD
    imagenes: data.imagenes || [],     // array de URLs
    descripcion: data.descripcion || '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

/** Actualizar hospedaje (admin) */
export const updateHospedaje = async (id, data) => {
  const docRef = doc(db, COLLECTIONS.HOSPEDAJES, id);
  await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
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
 * Estructura: { codigoUnico, hotelId, hotelNombre, lugarId, lugarNombre,
 *               precio, userId, userEmail, fechaEntrada, fechaSalida,
 *               estado, createdAt }
 */
export const createReservacion = async (data) => {
  const codigoUnico = generateBookingCode();
  const docRef = await addDoc(collection(db, COLLECTIONS.RESERVACIONES), {
    codigoUnico,
    hotelId: data.hotelId || '',
    hotelNombre: data.hotelNombre || '',
    lugarId: data.lugarId || '',
    lugarNombre: data.lugarNombre || '',
    precio: data.precio || 0,
    userId: data.userId || '',
    userEmail: data.userEmail || '',
    fechaEntrada: data.fechaEntrada || '',
    fechaSalida: data.fechaSalida || '',
    estado: 'pendiente',               // 'pendiente' | 'confirmada' | 'cancelada'
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return { id: docRef.id, codigoUnico };
};

/** Obtener reservaciones del usuario actual */
export const getReservacionesByUser = async (userId) => {
  const q = query(
    collection(db, COLLECTIONS.RESERVACIONES),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
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

// ─── Mantener compatibilidad con BookingScreen existente ───
/** @deprecated Usar createReservacion */
export const createBooking = createReservacion;
/** @deprecated Usar getReservacionesByUser */
export const getUserBookings = getReservacionesByUser;

// ─── Mantener compatibilidad con código anterior ───────────
/** @deprecated Usar getDestinos */
export const getDestinations = getDestinos;
/** @deprecated Usar getDestinoById */
export const getDestinationById = getDestinoById;
/** @deprecated Usar getDestinosByCategoria */
export const getDestinationsByCategory = getDestinosByCategoria;
