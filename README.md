# 🌎 AppTurismo — Aplicación Móvil de Turismo

[![Expo SDK](https://img.shields.io/badge/Expo%20SDK-57-blue?logo=expo)](https://expo.dev)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore%20%2B%20Auth-orange?logo=firebase)](https://firebase.google.com)
[![React Native](https://img.shields.io/badge/React%20Native-0.76-61DAFB?logo=react)](https://reactnative.dev)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

Aplicación móvil de turismo construida con **React Native + Expo**, usando **Firebase** como backend y base de datos. Permite a los usuarios explorar destinos turísticos, ver hospedajes disponibles, realizar reservaciones y gestionar su perfil. Los administradores cuentan con un panel CRUD para gestionar el contenido de la plataforma.

---

## ✨ Características principales

| Funcionalidad | Descripción |
|---|---|
| 🔐 Autenticación | Registro e inicio de sesión con Email/Password via Firebase Auth |
| 🌍 Destinos | Exploración de destinos turísticos con filtros por categoría y búsqueda |
| 🏨 Hospedajes | Listado de hoteles y alojamientos disponibles |
| 📅 Reservaciones | Sistema de reserva vinculado al usuario autenticado |
| 👤 Perfil | Gestión de datos personales del usuario |
| 🛠️ Panel Admin | CRUD completo de destinos y hospedajes (solo rol `admin`) |
| 🔒 Roles | Sistema de roles `admin` / `user` gestionado en Firestore |

---

## 🛠️ Stack Tecnológico

- **Framework:** React Native 0.76 + Expo SDK 57
- **Backend / DB:** Firebase (Firestore, Authentication, Storage)
- **UI:** React Native Paper (Material Design 3)
- **Navegación:** React Navigation (Stack + Bottom Tabs)
- **Iconos:** @expo/vector-icons (Ionicons + MaterialCommunityIcons)
- **Gestor de paquetes:** pnpm

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
pnpm exec expo start
```

Escanea el código QR con la app **Expo Go** en tu dispositivo.

---

## 🔥 Configuración Firebase

> ⚠️ **El archivo `firebaseConfig.js` contiene las credenciales del proyecto.** No compartas este archivo públicamente en repositorios abiertos.

1. Ve a [Firebase Console](https://console.firebase.google.com)
2. Crea o selecciona tu proyecto
3. Agrega una app Web y copia la configuración en `src/firebase/firebaseConfig.js`
4. Habilita los siguientes servicios:
   - **Authentication** → Email/Password
   - **Firestore Database** → Modo producción
   - **Storage** (opcional para imágenes)

### Colecciones Firestore requeridas

| Colección | Campos principales |
|---|---|
| `users` | `uid`, `nombre`, `email`, `cedula`, `direccion`, `ciudad`, `rol` |
| `destinos` | `nombre`, `descripcion`, `fotos[]`, `contacto`, `categoria`, `pais`, `precio`, `duracion`, `rating` |
| `hospedajes` | `nombre`, `lugar`, `precio`, `imagenes[]`, `descripcion`, `estrellas` |
| `reservaciones` | `codigo`, `userId`, `hospedaje`, `destino`, `precio`, `estado` |

### Inicialización con datos de prueba

```bash
# Requiere serviceAccountKey.json descargado de Firebase Console
# → Configuración del proyecto → Cuentas de servicio → Generar nueva clave privada
node seed.mjs
```

> ⚠️ Elimina `serviceAccountKey.json` después de ejecutar el seed. Nunca lo subas al repositorio.

---

## 🏗️ Estructura del proyecto

```
App_turismo/
├── src/
│   ├── components/       # Componentes reutilizables (DestinationCard, SearchBar, etc.)
│   ├── firebase/         # Configuración y operaciones Firebase
│   │   ├── firebaseConfig.js   # SDK config (⚠️ contiene credenciales)
│   │   ├── auth.js             # Funciones de autenticación
│   │   ├── firestore.js        # CRUD de colecciones
│   │   └── storage.js          # Subida de archivos
│   ├── hooks/            # Custom hooks (useAuth, useAdminRole)
│   ├── navigation/       # AppNavigator (Stack + Bottom Tabs)
│   ├── screens/          # Pantallas de la aplicación
│   └── theme/            # Paleta de colores, tipografía, spacing
├── assets/               # Imágenes y recursos estáticos
├── seed.mjs              # Script de inicialización de datos
├── firestore.rules       # Reglas de seguridad de Firestore
└── App.js                # Entry point
```

---

## 👤 Usuario Administrador

Al ejecutar `node seed.mjs`, se crea automáticamente un usuario administrador:

| Campo | Valor |
|---|---|
| Email | `admin@turismo.com` |
| Contraseña | `Admin123!` |

> ⚠️ Cambia la contraseña después del primer inicio de sesión.

---

## 🔐 Reglas de Seguridad (Firestore)

Las reglas en `firestore.rules` garantizan que:
- Los usuarios autenticados pueden **leer** destinos y hospedajes
- Solo los **admins** pueden crear, editar o eliminar contenido
- Cada usuario solo puede ver y modificar **sus propias** reservaciones y perfil

---

## 📱 Pantallas

| Pantalla | Ruta | Descripción |
|---|---|---|
| Login | `LoginScreen` | Inicio de sesión |
| Registro | `RegisterScreen` | Creación de cuenta con datos personales |
| Home | `HomeScreen` | Destinos destacados + FAB admin |
| Explorar | `ExploreScreen` | Todos los destinos con filtros |
| Detalle | `DestinationDetailScreen` | Info completa del destino |
| Reservar | `BookingScreen` | Formulario de reservación |
| Perfil | `ProfileScreen` | Datos del usuario |
| Admin | `AdminPanelScreen` | CRUD destinos y hospedajes (admin only) |

---

## 📄 Licencia

MIT © 2025 — Alexis001X
