// ============================================================
// FIREBASE STORAGE – Gestión de archivos e imágenes
// ============================================================

import { ref, uploadBytesResumable, uploadString, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebaseConfig';
import * as FileSystem from 'expo-file-system/legacy';

/**
 * Subir una imagen de perfil de usuario
 * @param {string} userId - ID del usuario
 * @param {Blob} imageBlob - Blob de la imagen
 * @param {Function} onProgress - Callback de progreso (0-100)
 * @returns {Promise<string>} URL de descarga de la imagen
 */
export const uploadProfileImage = async (userId, imageBlob, onProgress) => {
  const storageRef = ref(storage, `profile_images/${userId}/avatar.jpg`);
  return _uploadFile(storageRef, imageBlob, onProgress);
};

/**
 * Subir una imagen de destino turístico
 * @param {string} destinationId - ID del destino
 * @param {string} fileName - Nombre del archivo
 * @param {Blob} imageBlob - Blob de la imagen
 * @param {Function} onProgress - Callback de progreso (0-100)
 * @returns {Promise<string>} URL de descarga de la imagen
 */
export const uploadDestinationImage = async (destinationId, fileName, imageBlob, onProgress) => {
  const storageRef = ref(storage, `destination_images/${destinationId}/${fileName}`);
  return _uploadFile(storageRef, imageBlob, onProgress);
};

/**
 * Eliminar un archivo de Storage por su URL
 * @param {string} fileUrl - URL del archivo a eliminar
 */
export const deleteFile = async (fileUrl) => {
  const fileRef = ref(storage, fileUrl);
  await deleteObject(fileRef);
};

// ─── Helper interno ────────────────────────────────────────
const _uploadFile = (storageRef, data, onProgress) => {
  return new Promise((resolve, reject) => {
    const uploadTask = uploadBytesResumable(storageRef, data);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (onProgress) onProgress(Math.round(progress));
      },
      (error) => reject(error),
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(downloadURL);
      }
    );
  });
};

/**
 * Subir imagen desde URI local (expo-image-picker) a Firebase Storage.
 *
 * Usa expo-file-system para leer la imagen como base64 y convertirla a
 * Uint8Array antes de subirla, evitando el problema de React Native's
 * Blob store (fetch().blob()) que falla con URIs de galería (content://).
 *
 * @param {string} localUri  - URI local devuelta por expo-image-picker
 * @param {string} folder    - Carpeta en Storage ('destinos', 'hospedajes', etc.)
 * @param {Function} onProgress - Callback de progreso (0–100)
 * @returns {Promise<string>} URL pública de descarga
 */
export const uploadImageFromUri = async (localUri, folder = 'admin_images', onProgress) => {
  // 1. Leer el archivo como base64 con expo-file-system/legacy
  const base64 = await FileSystem.readAsStringAsync(localUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  // 2. Subir directamente como string base64 con uploadString
  //    (uploadBytesResumable no acepta Uint8Array/ArrayBuffer en React Native)
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.jpg`;
  const storageRef = ref(storage, `${folder}/${fileName}`);

  const snapshot = await uploadString(storageRef, base64, 'base64', {
    contentType: 'image/jpeg',
  });

  return getDownloadURL(snapshot.ref);
};
