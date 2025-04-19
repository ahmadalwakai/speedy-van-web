import { create } from 'zustand';
import api from '@/services/api';
import Cookies from 'js-cookie';
import { User } from '@/types';
import logger from '@/services/logger';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => void;
  setUserFromToken: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,

  login: async (email, password) => {
    try {
      const res = await api.post('/api/auth/login', { email, password });

      Cookies.set('token', res.data.token, { secure: true, sameSite: 'strict' });
      Cookies.set('refreshToken', res.data.refreshToken, { secure: true, sameSite: 'strict' });

      set({ user: res.data.user, isAuthenticated: true });

      logger.info(`✅ User logged in: ${email}`);
    } catch (error) {
      logger.error(`❌ Login failed for ${email}: ${error}`);
      throw new Error('Invalid email or password');
    }
  },

  register: async (email, username, password) => {
    try {
      const res = await api.post('/api/auth/register', { email, username, password });

      Cookies.set('token', res.data.token, { secure: true, sameSite: 'strict' });
      Cookies.set('refreshToken', res.data.refreshToken, { secure: true, sameSite: 'strict' });

      set({ user: res.data.user, isAuthenticated: true });

      logger.info(`✅ User registered: ${email}`);
    } catch (error) {
      logger.error(`❌ Registration failed for ${email}: ${error}`);
      throw new Error('Registration failed');
    }
  },

  logout: () => {
    Cookies.remove('token');
    Cookies.remove('refreshToken');
    set({ user: null, isAuthenticated: false });
    logger.info('👋 User logged out');
  },

  setUserFromToken: async () => {
    const token = Cookies.get('token');
    if (!token) return;

    try {
      const res = await api.get('/api/auth/me');
      set({ user: res.data.user, isAuthenticated: true });
      logger.info('🔄 User session restored');
    } catch (err) {
      logger.warn('⚠️ Failed to restore session');
      Cookies.remove('token');
      Cookies.remove('refreshToken');
      set({ user: null, isAuthenticated: false });
    }
  },
}));
