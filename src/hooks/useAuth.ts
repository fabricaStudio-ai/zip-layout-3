import { useEffect, useState } from 'react';
import { observeAuthState, logoutUser, type AuthUser } from '../services/authService';

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = observeAuthState(currentUser => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await logoutUser();
  };

  return {
    user,
    loading,
    logout,
  };
}
