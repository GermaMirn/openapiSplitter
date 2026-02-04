import { Request, Response, NextFunction } from 'express';
import { logger } from '../../shared/utils/logger';
import { DomainException } from '../../domain/exceptions/domain-exceptions';

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
    logger.error(`Domain error ${err.statusCode}: ${err.message}`, {
      path: req.path,
      method: req.method,
      code: err.code,
      stack: err.stack,
    });

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

  logger.error(`Error ${statusCode}: ${message}`, {
    path: req.path,
    method: req.method,
    stack: err.stack,
  });

  return res.status(statusCode).json({
    success: false,
    error: {
      message,
      code: 'INTERNAL_ERROR',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
};
