import axios from "axios";
import { API_URL } from '../config/api';

// Динамически определяем baseURL на основе текущего домена
const getBaseURL = () => {
  // В dev режиме используем переменную окружения или прокси через Vite
  const isDevMode = import.meta.env.DEV;
  const devApiUrl = API_URL;

  if (isDevMode && devApiUrl) {
    // Если указан URL API для dev режима, используем его
    return devApiUrl.endsWith('/api') ? devApiUrl : `${devApiUrl}/api`;
  }

  if (isDevMode) {
    // В dev режиме без переменной окружения используем прокси через Vite
    return "/api";
  }

  // В продакшене используем текущий домен + /api
  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    // Убираем порт если он стандартный (443 для https, 80 для http)
    let baseUrl = origin;
    if (origin.includes(':443')) {
      baseUrl = origin.replace(':443', '');
    } else if (origin.includes(':80') && origin.startsWith('http://')) {
      baseUrl = origin.replace(':80', '');
    }
    return `${baseUrl}/api`;
  }
  // Fallback для SSR или других случаев
  return "/api";
};

export const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    "Content-Type": "application/json",
  },
});

// Интерцептор для обработки ошибок
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Обработка ошибок
    if (error.response?.status === 401) {
      // Можно добавить логику для неавторизованных запросов
      console.error('Unauthorized request');
    }
    return Promise.reject(error);
  }
);
