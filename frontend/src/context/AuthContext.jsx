import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../api/api';
import { tokenStorage } from '../api/tokenStorage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadMe() {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function login(email, password) {
    const { data } = await api.post('/auth/login', { email, password });
    tokenStorage.setTokens(data);
    setUser(data.user);
  }

  async function register(email, password, role = 'user') {
    const { data } = await api.post('/auth/register', { email, password, role });
    tokenStorage.setTokens(data);
    setUser(data.user);
  }

  async function logout() {
    try { await api.post('/auth/logout', { refreshToken: tokenStorage.getRefresh() }); } catch {}
    tokenStorage.clear();
    setUser(null);
  }

  useEffect(() => {
    if (tokenStorage.getAccess()) loadMe(); else setLoading(false);
    const onLogout = () => setUser(null);
    const onRefreshed = (event) => event.detail && setUser(event.detail);
    window.addEventListener('auth:logout', onLogout);
    window.addEventListener('auth:refreshed', onRefreshed);
    return () => {
      window.removeEventListener('auth:logout', onLogout);
      window.removeEventListener('auth:refreshed', onRefreshed);
    };
  }, []);

  const value = useMemo(() => ({ user, loading, login, register, logout, isAdmin: user?.role === 'admin' }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
