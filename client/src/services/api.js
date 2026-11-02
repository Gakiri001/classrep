import axios from 'axios';

export const TOKEN_KEY = 'classrep_token';
export const MEMBER_KEY = 'classrep_member';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && sessionStorage.getItem(TOKEN_KEY)) {
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(MEMBER_KEY);
      window.dispatchEvent(new CustomEvent('classrep:auth-expired'));
    }
    return Promise.reject(error);
  },
);

export function messageFromError(error, fallback = 'Something went wrong. Please try again.') {
  if (!error.response) return 'Unable to reach the server. Check your connection and try again.';
  return error.response.data?.message || fallback;
}

export default api;
