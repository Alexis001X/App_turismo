/**
 * test-add-destino.mjs
 * ─────────────────────────────────────────────────────────────
 * Script de prueba: agrega UN nuevo destino a la colección
 * /destinos en Firestore usando Firebase Admin SDK.
 *
 * Uso: node test-add-destino.mjs
 *
 * Requiere: serviceAccountKey.json en la raíz del proyecto.
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

// ─── Cargar credenciales ──────────────────────────────────────
const { default: serviceAccount } = await import('./serviceAccountKey.json', {
  with: { type: 'json' },
});

const app = initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore(app);
const now = FieldValue.serverTimestamp();

// ─── Nuevo destino de prueba ──────────────────────────────────
const nuevoDestino = {
  nombre:      'Ciudad Perdida – Sierra Nevada',
  descripcion: 'Antigua ciudad indígena Tairona escondida en la Sierra Nevada de Santa Marta. Accesible solo por sendero de 4 días. Patrimonio arqueológico de Colombia.',
  fotos:       [
    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Ciudad_Perdida_stairway.jpg/1280px-Ciudad_Perdida_stairway.jpg',
  ],
  contacto:    '+57 (5) 421-0900',
  categoria:   'Aventura',
  rating:      4.9,
  precio:      420,
  duracion:    '5 días',
  pais:        'Colombia',
  createdAt:   now,
  updatedAt:   now,
};

// ─── Insertar en Firestore ────────────────────────────────────
console.log('📤 Subiendo nuevo destino a Firestore...');
const ref = await db.collection('destinos').add(nuevoDestino);

console.log(`\n✅ Destino creado exitosamente:`);
console.log(`   ID del documento : ${ref.id}`);
console.log(`   Nombre           : ${nuevoDestino.nombre}`);
console.log(`   Categoría        : ${nuevoDestino.categoria}`);
console.log(`   País             : ${nuevoDestino.pais}`);
console.log(`   Precio           : $${nuevoDestino.precio}`);
console.log(`\n🔗 Verifica en Firestore Console:`);
console.log(`   https://console.firebase.google.com/project/appturismo-7b724/firestore/data/destinos/${ref.id}`);

process.exit(0);
