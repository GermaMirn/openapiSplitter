/**
 * Общая обёртка для успешных ответов API
*/
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

/**
 * Обёртка для ошибок API
*/
export interface ApiErrorResponse {
  success: false;
  error: {
    message: string;
    code: string;
  };
}

/**
 * Общий тип ответа API
*/
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
