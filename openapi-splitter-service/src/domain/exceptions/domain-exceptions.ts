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
 * Невалидный YAML синтаксис
 */
export class InvalidYamlException extends DomainException {
  constructor(message: string = 'Invalid YAML syntax') {
    super(message, 'INVALID_YAML', 400);
    this.name = 'InvalidYamlException';
    Object.setPrototypeOf(this, InvalidYamlException.prototype);
  }
}

/**
 * Невалидная OpenAPI спецификация (отсутствуют обязательные поля)
 */
export class InvalidOpenApiException extends DomainException {
  constructor(message: string = 'Invalid OpenAPI specification') {
    super(message, 'INVALID_OPENAPI', 400);
    this.name = 'InvalidOpenApiException';
    Object.setPrototypeOf(this, InvalidOpenApiException.prototype);
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

/**
 * Слишком большой размер спецификации
 */
export class SpecificationTooLargeException extends DomainException {
  constructor(message: string = 'OpenAPI specification is too large') {
    super(message, 'SPEC_TOO_LARGE', 413);
    this.name = 'SpecificationTooLargeException';
    Object.setPrototypeOf(this, SpecificationTooLargeException.prototype);
  }
}
