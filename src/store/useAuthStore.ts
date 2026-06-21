import { create } from 'zustand';
import { Admin } from '@/types';
import { api } from '@/lib/api';

interface AuthState {
  currentAdmin: Admin | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  currentAdmin: null,

  login: async (username, password) => {
    try {
      const admin = await api.post<Admin>('/auth/login', { username, password });
      set({ currentAdmin: admin });
      return true;
    } catch {
      return false;
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      set({ currentAdmin: null });
    }
  },

  checkAuth: async () => {
    try {
      const admin = await api.get<Admin>('/auth/me');
      set({ currentAdmin: admin });
    } catch {
      set({ currentAdmin: null });
    }
  },

  isAuthenticated: () => get().currentAdmin !== null,
}));
