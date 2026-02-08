import axios from "axios";
import { API_URL, API_VERSION } from '../config/api';

// Динамически определяем baseURL на основе текущего домена и версии API
const getBaseURL = () => {
  const apiPrefix = `/api/${API_VERSION}`;
  // В dev режиме используем переменную окружения или прокси через Vite
  const isDevMode = import.meta.env.DEV;
  const devApiUrl = API_URL;

  if (isDevMode && devApiUrl) {
    // Если указан URL API для dev режима, используем его
    const base = devApiUrl.endsWith('/api') ? devApiUrl : `${devApiUrl}/api`;
    return base.endsWith(API_VERSION) ? base : `${base}/${API_VERSION}`;
  }

  if (isDevMode) {
    return apiPrefix;
  }

  // В продакшене используем текущий домен + /api/v1
  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    let baseUrl = origin;
    if (origin.includes(':443')) {
      baseUrl = origin.replace(':443', '');
    } else if (origin.includes(':80') && origin.startsWith('http://')) {
      baseUrl = origin.replace(':80', '');
    }
    return `${baseUrl}${apiPrefix}`;
  }
  return apiPrefix;
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
