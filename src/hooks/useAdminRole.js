// ============================================================
// useAdminRole – Hook para verificar si el usuario actual es admin
// Consulta el campo 'rol' en Firestore /users/{uid}
// ============================================================

import { useState, useEffect } from 'react';
import { getUserProfile } from '../firebase/firestore';
import { useAuth } from './useAuth';

/**
 * @returns {{ isAdmin: boolean, loadingRole: boolean }}
 */
export const useAdminRole = () => {
  const { user, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loadingRole, setLoadingRole] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      setIsAdmin(false);
      setLoadingRole(false);
      return;
    }

    let cancelled = false;
    const checkRole = async () => {
      try {
        const profile = await getUserProfile(user.uid);
        if (!cancelled) {
          setIsAdmin(profile?.rol === 'admin');
        }
      } catch {
        if (!cancelled) setIsAdmin(false);
      } finally {
        if (!cancelled) setLoadingRole(false);
      }
    };

    checkRole();
    return () => { cancelled = true; };
  }, [user, loading]);

  return { isAdmin, loadingRole };
};
