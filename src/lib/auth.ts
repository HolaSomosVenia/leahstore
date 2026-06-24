import { create } from 'zustand';
import api from './api';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role?: 'USER' | 'ADMIN';
}

interface AuthStore {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  register: (email: string, password: string, name: string, phone?: string) => Promise<void>;
  login: (email: string, password: string) => Promise<User | undefined>;
  logout: () => void;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  checkAuth: () => Promise<void>;
}

export const useAuth = create<AuthStore>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,

  register: async (email: string, password: string, name: string, phone?: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/register', {
        email,
        password,
        name,
        phone,
      });

      set({
        user: response.data.user,
        token: response.data.token,
        isLoading: false,
      });

      // Guardar token en localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', response.data.token);
      }
    } catch (err: any) {
      set({
        error: err.response?.data?.error || 'Error en el registro',
        isLoading: false,
      });
      throw err;
    }
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/login', {
        email,
        password,
      });

      const user = response.data.user;
      set({ user, token: response.data.token, isLoading: false });

      if (typeof window !== 'undefined') {
        localStorage.setItem('token', response.data.token);
      }

      return user;
    } catch (err: any) {
      set({
        error: err.response?.data?.error || 'Error en el login',
        isLoading: false,
      });
      throw err;
    }
  },

  logout: () => {
    set({ user: null, token: null });
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  },

  setUser: (user: User | null) => {
    set({ user });
  },

  setToken: (token: string | null) => {
    set({ token });
  },

  checkAuth: async () => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('token');
    if (!token) return;
    set({ token });
    try {
      // Restaurar usuario desde el backend al recargar la página
      const response = await api.get('/auth/me');
      set({ user: response.data });
    } catch {
      // Token inválido o expirado
      localStorage.removeItem('token');
      set({ token: null, user: null });
    }
  },
}));
