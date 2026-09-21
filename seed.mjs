/**
 * seed.mjs – Script de inicialización de Firestore para AppTurismo
 * Ejecutar con: node seed.mjs
 *
 * Crea:
 *  - 1 usuario admin en /users
 *  - 2 destinos de ejemplo en /destinos
 *  - 2 hospedajes de ejemplo en /hospedajes
 *
 * REQUIERE: Firebase Admin SDK instalado como devDependency
 *   pnpm add -D firebase-admin
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// ─── IMPORTANTE: reemplaza con la ruta a tu serviceAccountKey.json ───────────
// Descárgalo desde: Firebase Console → Configuración del proyecto →
//   Cuentas de servicio → Generar nueva clave privada
const SERVICE_ACCOUNT_PATH = './serviceAccountKey.json';

let app;
try {
  const { default: serviceAccount } = await import(SERVICE_ACCOUNT_PATH, {
    with: { type: 'json' },
  });
  app = initializeApp({ credential: cert(serviceAccount) });
} catch (e) {
  console.error('❌ Error al cargar serviceAccountKey.json:', e);
  console.error('   Asegúrate de haberlo descargado correctamente y que sea un JSON válido.');
  process.exit(1);
}

const db = getFirestore(app);
const adminAuth = getAuth(app);
const now = FieldValue.serverTimestamp();

// ═══════════════════════════════════════════════════════════
// 1. USUARIO ADMIN
// ═══════════════════════════════════════════════════════════
console.log('👤 Creando usuario administrador...');
let adminUid;
try {
  const adminUser = await adminAuth.createUser({
    email: 'admin@turismo.com',
    password: 'Admin123!',
    displayName: 'Administrador',
    emailVerified: true,
  });
  adminUid = adminUser.uid;
  console.log(`   ✅ Usuario creado: ${adminUser.email} (uid: ${adminUid})`);
} catch (e) {
  if (e.code === 'auth/email-already-exists') {
    const existing = await adminAuth.getUserByEmail('admin@turismo.com');
    adminUid = existing.uid;
    console.log(`   ℹ️  Usuario ya existe (uid: ${adminUid})`);
  } else {
    throw e;
  }
}

// Guardar perfil admin en Firestore
await db.collection('users').doc(adminUid).set({
  uid: adminUid,
  nombre: 'Administrador',
  email: 'admin@turismo.com',
  cedula: '0000000000',
  direccion: 'Oficina Central',
  ciudad: 'Bogotá',
  rol: 'admin',
  createdAt: now,
  updatedAt: now,
}, { merge: true });
console.log('   ✅ Perfil admin guardado en Firestore /users');

// ═══════════════════════════════════════════════════════════
// 2. DESTINOS
// ═══════════════════════════════════════════════════════════
console.log('\n🌍 Creando destinos de ejemplo...');
const destinos = [
  {
    nombre: 'Cartagena de Indias',
    descripcion:
      'Ciudad amurallada en la costa caribe colombiana, declarada Patrimonio de la Humanidad por la UNESCO. Conocida por sus coloridas calles coloniales, playas cristalinas y vibrante vida nocturna.',
    fotos: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Cartagena_de_Indias_-_Walled_City.jpg/1280px-Cartagena_de_Indias_-_Walled_City.jpg',
    ],
    contacto: '+57 (5) 664-0000',
    categoria: 'Cultural',
    rating: 4.8,
    precio: 350,
    duracion: '4 días',
    pais: 'Colombia',
    createdAt: now,
    updatedAt: now,
  },
  {
    nombre: 'Parque Tayrona',
    descripcion:
      'Parque nacional natural ubicado en la Sierra Nevada de Santa Marta. Combinación perfecta de selva tropical y playas paradisíacas, hogar de comunidades indígenas Koguis.',
    fotos: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Playa_Cristal_Tayrona.jpg/1280px-Playa_Cristal_Tayrona.jpg',
    ],
    contacto: '+57 (5) 421-0800',
    categoria: 'Naturaleza',
    rating: 4.9,
    precio: 280,
    duracion: '3 días',
    pais: 'Colombia',
    createdAt: now,
    updatedAt: now,
  },
];

for (const destino of destinos) {
  const ref = await db.collection('destinos').add(destino);
  console.log(`   ✅ Destino creado: "${destino.nombre}" (id: ${ref.id})`);
}

// ═══════════════════════════════════════════════════════════
// 3. HOSPEDAJES
// ═══════════════════════════════════════════════════════════
console.log('\n🏨 Creando hospedajes de ejemplo...');
const hospedajes = [
  {
    nombre: 'Hotel Caribe Boutique',
    lugar: 'Cartagena de Indias',
    precio: 120,
    imagenes: [
      'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800',
    ],
    descripcion:
      'Hotel boutique en el corazón de la ciudad amurallada, con vista al mar Caribe. Piscina rooftop, desayuno incluido y tours personalizados.',
    estrellas: 4,
    createdAt: now,
    updatedAt: now,
  },
  {
    nombre: 'Ecohotel Sierra Tayrona',
    lugar: 'Parque Tayrona',
    precio: 85,
    imagenes: [
      'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800',
    ],
    descripcion:
      'Cabañas ecológicas en medio de la naturaleza, a 15 min caminando de las playas del Tayrona. Alimentación orgánica y guías especializados.',
    estrellas: 3,
    createdAt: now,
    updatedAt: now,
  },
];

for (const hospedaje of hospedajes) {
  const ref = await db.collection('hospedajes').add(hospedaje);
  console.log(`   ✅ Hospedaje creado: "${hospedaje.nombre}" (id: ${ref.id})`);
}

console.log('\n🎉 ¡Datos semilla creados exitosamente!');
console.log('\n📋 Credenciales del administrador:');
console.log('   Email:      admin@turismo.com');
console.log('   Contraseña: Admin123!');
console.log('   ⚠️  Cambia la contraseña después del primer login.\n');
process.exit(0);
