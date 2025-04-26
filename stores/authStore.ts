import { create } from 'zustand';
import api from '@/services/api';
import Cookies from 'js-cookie';
import logger from '@/services/logger';
import { GoogleAuthProvider, signInWithPopup, getAuth } from 'firebase/auth';
import { firebaseApp } from '@/lib/firebase';

interface User {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => void;
  setUserFromToken: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (email, password, rememberMe = false) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/auth/login', { email, password });
      
      const cookieOptions = {
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict' as const,
        expires: rememberMe ? 30 : undefined
      };

      Cookies.set('token', res.data.token, cookieOptions);
      Cookies.set('refreshToken', res.data.refreshToken, cookieOptions);

      set({ 
        user: res.data.user, 
        isAuthenticated: true,
        isLoading: false 
      });
      logger.info(`✅ User logged in: ${email}`);
    } catch (error: any) {
      logger.error(`❌ Login failed: ${error}`);
      set({ 
        error: error.response?.data?.message || 'Invalid email or password',
        isLoading: false 
      });
      throw error;
    }
  },

  loginWithGoogle: async () => {
    set({ isLoading: true, error: null });
    try {
      const auth = getAuth(firebaseApp);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();

      const res = await api.post('/auth/google', { token: idToken });
      
      Cookies.set('token', res.data.token, { 
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict' 
      });
      Cookies.set('refreshToken', res.data.refreshToken, { 
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict' 
      });

      set({ 
        user: res.data.user, 
        isAuthenticated: true,
        isLoading: false 
      });
      logger.info('✅ Google login successful');
    } catch (error: any) {
      logger.error(`❌ Google login failed: ${error}`);
      set({ 
        error: error.response?.data?.message || 'Google login failed',
        isLoading: false 
      });
      throw error;
    }
  },

  register: async (email, username, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/auth/register', { email, username, password });

      Cookies.set('token', res.data.token, { 
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict' 
      });
      Cookies.set('refreshToken', res.data.refreshToken, { 
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict' 
      });

      set({ 
        user: res.data.user, 
        isAuthenticated: true,
        isLoading: false 
      });
      logger.info(`✅ User registered: ${email}`);
    } catch (error: any) {
      logger.error(`❌ Registration failed: ${error}`);
      set({ 
        error: error.response?.data?.message || 'Registration failed',
        isLoading: false 
      });
      throw error;
    }
  },

  logout: () => {
    Cookies.remove('token');
    Cookies.remove('refreshToken');
    set({ 
      user: null, 
      isAuthenticated: false,
      error: null
    });
    logger.info('👋 User logged out');
  },

  setUserFromToken: async () => {
    const token = Cookies.get('token');
    if (!token) return;

    set({ isLoading: true });
    try {
      const res = await api.get('/auth/me');
      set({ 
        user: res.data.user, 
        isAuthenticated: true,
        isLoading: false 
      });
      logger.info('🔄 User session restored');
    } catch (err) {
      logger.warn('⚠️ Failed to restore session');
      Cookies.remove('token');
      Cookies.remove('refreshToken');
      set({ 
        user: null, 
        isAuthenticated: false,
        isLoading: false 
      });
    }
  },

  resetPassword: async (email) => {
    set({ isLoading: true, error: null });
    try {
      await api.post('/auth/reset-password', { email });
      set({ isLoading: false });
      logger.info(`📧 Password reset email sent to ${email}`);
    } catch (error: any) {
      logger.error(`❌ Password reset failed: ${error}`);
      set({ 
        error: error.response?.data?.message || 'Password reset failed',
        isLoading: false 
      });
      throw error;
    }
  },

  clearError: () => set({ error: null })
}));