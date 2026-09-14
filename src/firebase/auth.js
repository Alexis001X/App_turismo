// ============================================================
// FIREBASE AUTH – Funciones de autenticación
// Al registrar, guarda el perfil completo en Firestore /users
// ============================================================

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebaseConfig';

/**
 * Registrar un nuevo usuario con email y contraseña.
 * Guarda automáticamente el perfil completo en Firestore /users/{uid}
 *
 * @param {string} email
 * @param {string} password
 * @param {string} displayName
 * @param {object} extraData - { cedula, direccion, ciudad }
 * @returns {Promise<User>}
 */
export const registerUser = async (email, password, displayName, extraData = {}) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Actualizar displayName en Firebase Auth
  await updateProfile(user, { displayName });

  // Guardar perfil completo en Firestore
  await setDoc(doc(db, 'users', user.uid), {
    uid: user.uid,
    nombre: displayName,
    email: email,
    cedula: extraData.cedula || '',
    direccion: extraData.direccion || '',
    ciudad: extraData.ciudad || '',
    rol: 'user',           // 'user' | 'admin'
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return user;
};

/**
 * Iniciar sesión con email y contraseña
 */
export const loginUser = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

/**
 * Cerrar sesión del usuario actual
 */
export const logoutUser = async () => {
  await signOut(auth);
};

/**
 * Suscribirse a cambios de estado de autenticación
 * @param {Function} callback
 * @returns {Function} Unsubscribe
 */
export const subscribeToAuthState = (callback) => {
  return onAuthStateChanged(auth, callback);
};
