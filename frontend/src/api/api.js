import axios from 'axios';
import { tokenStorage } from './tokenStorage';

export const api = axios.create({ baseURL: 'http://localhost:5000/api' });

api.interceptors.request.use((config) => {
  const token = tokenStorage.getAccess();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let isRefreshing = false;
let queue = [];
const flushQueue = (error, token = null) => {
  queue.forEach(({ resolve, reject }) => error ? reject(error) : resolve(token));
  queue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status !== 401 || original?._retry || original?.url?.includes('/auth/refresh')) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => queue.push({ resolve, reject })).then((token) => {
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      });
    }

    original._retry = true;
    isRefreshing = true;
    try {
      const refreshToken = tokenStorage.getRefresh();
      const { data } = await axios.post('http://localhost:5000/api/auth/refresh', { refreshToken });
      tokenStorage.setTokens(data);
      api.defaults.headers.common.Authorization = `Bearer ${data.accessToken}`;
      flushQueue(null, data.accessToken);
      original.headers.Authorization = `Bearer ${data.accessToken}`;
      window.dispatchEvent(new CustomEvent('auth:refreshed', { detail: data.user }));
      return api(original);
    } catch (refreshError) {
      tokenStorage.clear();
      flushQueue(refreshError, null);
      window.dispatchEvent(new Event('auth:logout'));
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);
