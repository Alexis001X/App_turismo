// ============================================================
// useAuth – Custom hook para estado de autenticación
// ============================================================

import { useState, useEffect } from 'react';
import { subscribeToAuthState } from '../firebase/auth';

/**
 * Hook que expone el usuario actual y el estado de carga.
 *
 * @returns {{ user: object|null, loading: boolean, isAuthenticated: boolean }}
 *
 * @example
 * const { user, loading, isAuthenticated } = useAuth();
 */
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToAuthState((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    // Limpiar suscripción al desmontar
    return () => unsubscribe();
  }, []);

  return {
    user,
    loading,
    isAuthenticated: !!user,
  };
};
