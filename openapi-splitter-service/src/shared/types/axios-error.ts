import type { AxiosError } from 'axios';

/**
 * Структура ошибки от API
 */
export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

/**
 * Типизированная Axios ошибка с нашим форматом ответа
 */
export type TypedAxiosError = AxiosError<ApiErrorResponse>;

/**
 * Тип для ошибки в catch блоке.
 * В JavaScript catch может поймать что угодно, поэтому нужен union тип.
 */
export type CaughtError = Error | string | number | null | { message?: string };

/**
 * Type guard для проверки, что ошибка — это AxiosError
 */
export function isAxiosError(error: Error): error is TypedAxiosError {
  return 'isAxiosError' in error && (error as AxiosError).isAxiosError === true;
}
