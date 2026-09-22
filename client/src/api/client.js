import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

export function getAdminKey() {
  return localStorage.getItem('adminKey') || '';
}

export function setAdminKey(key) {
  localStorage.setItem('adminKey', key);
}

api.interceptors.request.use((config) => {
  if (config.url?.startsWith('/admin')) {
    config.headers['x-admin-key'] = getAdminKey();
  }
  return config;
});

export default api;
