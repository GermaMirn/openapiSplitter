import type { OpenApiVersion } from '@/domain/value-objects';
import type { OpenApiSpec } from '@/shared/types';

/**
 * Результат валидации OpenAPI спецификации
 */
export interface OpenApiValidationResult {
  version: OpenApiVersion;
  isValid: boolean;
  errors: string[];
}

/**
 * Интерфейс для валидации OpenAPI спецификаций
 */
export interface IOpenApiValidator {
  /**
   * Валидирует OpenAPI спецификацию
   * @throws InvalidOpenApiException если спецификация невалидна
   */
  validate(spec: OpenApiSpec): Promise<OpenApiValidationResult>;
}
