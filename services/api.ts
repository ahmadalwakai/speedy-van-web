import axios from 'axios'; 
import Cookies from 'js-cookie';
import logger from './logger';

/**
 * API client for Next.js API Routes with token refresh logic
 */
const api = axios.create({
  baseURL: '/api',   // استخدام API Routes مباشرة
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = Cookies.get('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    logger.debug(`Adding token to request: ${token.slice(0, 10)}...`);
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = Cookies.get('refreshToken');
      if (!refreshToken) {
        logger.warn('No refresh token, redirecting to login');
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
      try {
        logger.info('Attempting token refresh');
        const { data } = await axios.post('/api/auth/refresh', { refreshToken });
        Cookies.set('token', data.token, { secure: true, sameSite: 'strict' });
        error.config.headers.Authorization = `Bearer ${data.token}`;
        logger.info('Token refreshed successfully');
        return axios(error.config);
      } catch (refreshError) {
        logger.error(`Token refresh failed: ${refreshError}`);
        Cookies.remove('token');
        Cookies.remove('refreshToken');
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }
    logger.error(`API error: ${error}`);
    return Promise.reject(error);
  }
);

export default api;
