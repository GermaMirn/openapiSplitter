import { Request, Response, NextFunction } from 'express';
import { logger } from '@/shared/utils/logger';
import { DomainException } from '@/domain/exceptions';
import type { LogValue } from '@/shared/types';

/**
 * Создаёт объект для логирования ошибки
 */
function createErrorLogContext(req: Request, err: Error, code?: string): LogValue {
  return {
    path: req.path,
    method: req.method,
    code: code ?? 'UNKNOWN',
    stack: err.stack ?? null,
  };
}

/**
 * Middleware для обработки ошибок
 * Преобразует доменные исключения в HTTP ответы
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  // Если это доменное исключение, используем его статус код
  if (err instanceof DomainException) {
    logger.error(
      `Domain error ${err.statusCode}: ${err.message}`,
      createErrorLogContext(req, err, err.code)
    );

    return res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
        code: err.code,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
      },
    });
  }

  // Для остальных ошибок используем 500
  const statusCode = 500;
  const message = err.message || 'Internal Server Error';

  logger.error(
    `Error ${statusCode}: ${message}`,
    createErrorLogContext(req, err, 'INTERNAL_ERROR')
  );

  return res.status(statusCode).json({
    success: false,
    error: {
      message,
      code: 'INTERNAL_ERROR',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
};
