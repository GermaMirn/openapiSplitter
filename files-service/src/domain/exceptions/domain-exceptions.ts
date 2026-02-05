/**
 * Базовый класс для доменных исключений
 */
export class DomainException extends Error {
  constructor(
    message: string,
    public readonly code: string = 'DOMAIN_ERROR',
    public readonly statusCode: number = 400
  ) {
    super(message);
    this.name = 'DomainException';
    Object.setPrototypeOf(this, DomainException.prototype);
  }
}

/**
 * Файл не найден (по id или path)
 */
export class FileNotFoundError extends DomainException {
  constructor(message: string = 'File not found') {
    super(message, 'FILE_NOT_FOUND', 404);
    this.name = 'FileNotFoundError';
    Object.setPrototypeOf(this, FileNotFoundError.prototype);
  }
}
