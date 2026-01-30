'use client';

import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { api } from './api';

const TOKEN_KEY = 'gesturial.token';

type AuthContextValue = {
  token: string | null;
  username: string | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem(TOKEN_KEY);
    if (saved) {
      setToken(saved);
      api
        .me(saved)
        .then((user) => setUsername(user.username))
        .catch(() => {
          localStorage.removeItem(TOKEN_KEY);
          setToken(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (user: string, pass: string) => {
    const { token: newToken } = await api.login({ username: user, password: pass });
    localStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
    const me = await api.me(newToken);
    setUsername(me.username);
  };

  const register = async (user: string, pass: string) => {
    const { token: newToken } = await api.register({ username: user, password: pass });
    localStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
    const me = await api.me(newToken);
    setUsername(me.username);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUsername(null);
  };

  const value = useMemo(
    () => ({ token, username, loading, login, register, logout }),
    [token, username, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
