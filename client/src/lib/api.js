import axios from 'axios';

export const TOKEN_KEY = 'pmp_token';

const api = axios.create({ baseURL: '/api' });

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-logout on invalid/expired token
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && localStorage.getItem(TOKEN_KEY)) {
      localStorage.removeItem(TOKEN_KEY);
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login?expired=1';
      }
    }
    return Promise.reject(err);
  }
);

/** Extract a friendly error message from an axios error */
export function errMsg(err, fallback = 'Something went wrong') {
  return err.response?.data?.message || err.message || fallback;
}

export default api;
