import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Добавляем access token в каждый запрос, если он есть
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access') || sessionStorage.getItem('access');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

export function getImageUrl(type, filename) {
  if (!filename) return '';
  return `${api.defaults.baseURL}/image/photo/${type}/${filename}`;
}

export default api; 