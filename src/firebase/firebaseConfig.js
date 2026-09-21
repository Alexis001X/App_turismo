// ============================================================
// FIREBASE CONFIGURATION – AppTurismo
// ============================================================
import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyD7as61o3m_6X9dVy5CGaiqpJ4DVdV-qAI",
  authDomain: "appturismo-7b724.firebaseapp.com",
  projectId: "appturismo-7b724",
  storageBucket: "appturismo-7b724.firebasestorage.app",
  messagingSenderId: "1088971665521",
  appId: "1:1088971665521:web:26126864989cf7ad5e6bd0",
  measurementId: "G-CC5CMN9778"
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;