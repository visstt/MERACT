import axios from "axios";

import { useAuthStore } from "../stores/authStore";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Интерцептор для добавления токена в каждый запрос
api.interceptors.request.use(
  (config) => {
    // Получаем токен из стора
    const token = useAuthStore.getState().getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Интерцептор для обработки ответов (например, для автоматического логаута при 401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Если получили 401, очищаем стор
      useAuthStore.getState().logout();
      // Можно также перенаправить на страницу логина
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default api;
