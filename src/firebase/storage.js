// ============================================================
// FIREBASE STORAGE – Gestión de archivos e imágenes
// ============================================================

import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebaseConfig';

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
const _uploadFile = (storageRef, blob, onProgress) => {
  return new Promise((resolve, reject) => {
    const uploadTask = uploadBytesResumable(storageRef, blob);

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
