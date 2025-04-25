import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../api.d';

interface AuthState {
  user: User | null;
  error: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
  setError: (error: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      error: null,
      login: (user: User, token: string) => {
        set({ user: { ...user, isAdmin: user.role === 'admin' } });
        localStorage.setItem('auth_token', token);
      },
      setError: (error: string) => set({ error }),
      logout: () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth-storage');
        set({ user: null });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
);
 