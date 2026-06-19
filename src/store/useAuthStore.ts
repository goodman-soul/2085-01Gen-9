import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Admin } from '@/types';

interface AuthState {
  currentAdmin: Admin | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: () => boolean;
}

const defaultAdmin: Admin = {
  id: 'admin-1',
  username: 'admin',
  password: 'admin123',
  name: '系统管理员',
  role: '超级管理员',
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      currentAdmin: null,

      login: (username, password) => {
        if (username === defaultAdmin.username && password === defaultAdmin.password) {
          set({ currentAdmin: defaultAdmin });
          return true;
        }
        return false;
      },

      logout: () => set({ currentAdmin: null }),

      isAuthenticated: () => get().currentAdmin !== null,
    }),
    { name: 'auth-store' }
  )
);
