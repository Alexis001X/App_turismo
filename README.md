# 🌎 AppTurismo — Aplicación Móvil de Turismo

[![Expo SDK](https://img.shields.io/badge/Expo%20SDK-57-blue?logo=expo)](https://expo.dev)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore%20%2B%20Auth%20%2B%20Storage-orange?logo=firebase)](https://firebase.google.com)
[![React Native](https://img.shields.io/badge/React%20Native-0.76-61DAFB?logo=react)](https://reactnative.dev)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

Aplicación móvil de turismo construida con **React Native + Expo SDK 57**, usando **Firebase** como backend completo (Auth, Firestore, Storage). Permite a los usuarios explorar destinos turísticos, ver hospedajes disponibles, realizar reservaciones con selector de fecha nativo y gestionar su perfil. Los administradores cuentan con un panel CRUD para gestionar destinos, hospedajes e imágenes directamente desde el dispositivo.

---

## ✨ Características principales

| Funcionalidad | Descripción |
|---|---|
| 🔐 Autenticación | Registro e inicio de sesión con Email/Password via Firebase Auth |
| 🌍 Destinos | Exploración de destinos turísticos con filtros por categoría y búsqueda |
| 🏨 Hospedajes | Listado de hoteles y alojamientos vinculados a destinos |
| 📅 Reservaciones | Sistema de reserva con selector de fecha nativo (DateTimePicker) |
| 👤 Perfil | Gestión de datos personales + panel de "Mis Reservas" en formato ticket |
| 🛠️ Panel Admin | CRUD completo de destinos y hospedajes (solo rol `admin`) |
| 🔒 Roles | Sistema de roles `admin` / `user` gestionado en Firestore |
| 🖼️ Subida de imágenes | Galería del dispositivo → Firebase Storage (base64 via expo-file-system) |
| 🗺️ Combobox destinos | Selector modal de destinos en formulario de hospedajes |

---

## 🛠️ Stack Tecnológico

- **Framework:** React Native 0.76 + Expo SDK 57
- **Backend / DB:** Firebase (Firestore, Authentication, Storage)
- **UI:** React Native Paper (Material Design 3)
- **Navegación:** React Navigation (Stack + Bottom Tabs)
- **Iconos:** @expo/vector-icons (Ionicons + MaterialCommunityIcons)
- **Gestor de paquetes:** pnpm
- **Fecha nativa:** @react-native-community/datetimepicker
- **Sistema de archivos:** expo-file-system (legacy API)
- **Selector de imágenes:** expo-image-picker

---

## 📦 Instalación y ejecución

### Prerequisitos
- Node.js ≥ 18
- pnpm instalado globalmente (`npm install -g pnpm`)
- Expo Go instalado en el dispositivo móvil (SDK 57 compatible)

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/Alexis001X/App_turismo.git
cd App_turismo

# 2. Instalar dependencias
pnpm install

# 3. Configurar Firebase
#    → Copia tu configuración en src/firebase/firebaseConfig.js
#    → Ver sección "Configuración Firebase" más abajo

# 4. Iniciar el servidor de desarrollo
pnpm exec expo start --clear
```

Escanea el código QR con la app **Expo Go** en tu dispositivo.

---

## 🔥 Configuración Firebase

> ⚠️ **El archivo `firebaseConfig.js` contiene las credenciales del proyecto.** No compartas este archivo públicamente en repositorios abiertos. Está incluido en `.gitignore`.

1. Ve a [Firebase Console](https://console.firebase.google.com)
2. Crea o selecciona tu proyecto
3. Agrega una app Web y copia la configuración en `src/firebase/firebaseConfig.js`
4. Habilita los siguientes servicios:
   - **Authentication** → Email/Password
   - **Firestore Database** → Modo producción
   - **Storage** → Para imágenes de destinos y hospedajes

### Colecciones Firestore

| Colección | Campos principales |
|---|---|
| `users` | `uid`, `nombre`, `email`, `cedula`, `direccion`, `ciudad`, `rol` |
| `destinos` | `nombre`, `descripcion`, `fotos[]`, `contacto`, `categoria`, `pais`, `precio`, `duracion`, `rating` |
| `hospedajes` | `nombre`, `lugar`, `lugarId`, `precio`, `imagenes[]`, `descripcion`, `estrellas` |
| `reservaciones` | `codigo`, `userId`, `userEmail`, `lugarId`, `lugarNombre`, `hotelId`, `hotelNombre`, `fechaEntrada`, `fechaSalida`, `viajeros`, `precio`, `notas`, `estado`, `createdAt` |

### Reglas de Storage recomendadas

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /destinos/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    match /hospedajes/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

---

## 🏗️ Estructura del proyecto

```
App_turismo/
├── src/
│   ├── components/
│   │   ├── DestinationCard.jsx    # Tarjeta de destino
│   │   ├── SearchBar.jsx          # Barra de búsqueda
│   │   └── CategoryChip.jsx       # Chip de categoría
│   ├── firebase/
│   │   ├── firebaseConfig.js      # SDK config (⚠️ credenciales — no subir)
│   │   ├── auth.js                # Registro, login, logout
│   │   ├── firestore.js           # CRUD destinos, hospedajes, reservaciones
│   │   └── storage.js             # Subida de imágenes (base64 → Firebase Storage)
│   ├── hooks/
│   │   ├── useAuth.js             # Hook de autenticación Firebase
│   │   └── useAdminRole.js        # Hook de verificación de rol admin
│   ├── navigation/
│   │   └── AppNavigator.jsx       # Stack + Bottom Tabs navigation
│   ├── screens/
│   │   ├── LoginScreen.jsx
│   │   ├── RegisterScreen.jsx
│   │   ├── HomeScreen.jsx         # Destinos destacados + FAB admin
│   │   ├── ExploreScreen.jsx      # Búsqueda y filtros
│   │   ├── DestinationDetailScreen.jsx
│   │   ├── BookingScreen.jsx      # Reserva con DateTimePicker nativo
│   │   ├── ProfileScreen.jsx      # Perfil + Mis Reservas (tickets)
│   │   └── AdminPanelScreen.jsx   # CRUD admin + upload imágenes
│   └── theme/
│       └── theme.js               # Paleta, tipografía, spacing, shadows
├── assets/
├── seed.mjs                       # Script de datos iniciales (requiere serviceAccountKey)
├── firestore.rules                # Reglas de seguridad Firestore
├── .gitignore
└── App.js
```

---

## 👤 Usuario Administrador

Al ejecutar `node seed.mjs` se crea automáticamente:

| Campo | Valor |
|---|---|
| Email | `admin@turismo.com` |
| Contraseña | `Admin123!` |

> ⚠️ Cambia la contraseña después del primer inicio de sesión.

Para asignar el rol manualmente, actualiza el campo `rol: "admin"` en el documento del usuario en la colección `users` de Firestore.

---

## 🔐 Seguridad

- `firebaseConfig.js` y `serviceAccountKey.json` están en `.gitignore` — **nunca se suben al repositorio**
- Las reglas en `firestore.rules` garantizan que:
  - Usuarios autenticados pueden **leer** destinos y hospedajes
  - Solo los **admins** pueden crear, editar o eliminar contenido
  - Cada usuario solo puede ver **sus propias** reservaciones y perfil
- Las imágenes se suben a Firebase Storage usando `uploadString` con codificación base64 (compatible con Expo Go en Android/iOS)

---

## 📱 Pantallas

| Pantalla | Componente | Descripción |
|---|---|---|
| Login | `LoginScreen` | Inicio de sesión |
| Registro | `RegisterScreen` | Creación de cuenta con datos personales |
| Home | `HomeScreen` | Destinos destacados + botón flotante admin |
| Explorar | `ExploreScreen` | Todos los destinos con filtros y búsqueda |
| Detalle | `DestinationDetailScreen` | Info completa del destino |
| Reservar | `BookingScreen` | Formulario con selector de fechas nativo |
| Perfil | `ProfileScreen` | Datos del usuario + panel "Mis Reservas" |
| Admin | `AdminPanelScreen` | CRUD destinos/hospedajes + subida de imágenes |

---

## 🔧 Notas técnicas importantes

### Subida de imágenes en React Native
La app usa `expo-file-system/legacy` para leer imágenes como base64 y `uploadString` de Firebase Storage — evitando los problemas de `fetch().blob()` con URIs `content://` de la galería Android.

### DateTimePicker en Android
Se usa `onChange` (deprecated en v9 pero funcional) en lugar de `onValueChange`, ya que `onValueChange` en `@react-native-community/datetimepicker@9.1.0` tiene un bug conocido en Android donde devuelve `undefined` con `display="default"`.

### Roles de usuario
El rol se guarda en Firestore (`users/{uid}.rol`). El hook `useAdminRole` verifica el rol en tiempo real. El botón flotante de admin en `HomeScreen` y toda la pantalla `AdminPanelScreen` son visibles únicamente para usuarios con `rol === 'admin'`.

### Reservaciones
El puente `createBooking` en `firestore.js` mapea campos en inglés (UI) a campos en español (Firestore schema). Las consultas usan ordenamiento del lado del cliente para evitar la necesidad de índices compuestos en Firestore.

---

## 📄 Licencia

MIT © 2025 — Alexis001X
