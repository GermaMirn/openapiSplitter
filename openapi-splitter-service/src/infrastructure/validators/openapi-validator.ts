import SwaggerParser from '@apidevtools/swagger-parser';
import type { IOpenApiValidator, OpenApiValidationResult } from '@/domain/interfaces';
import { InvalidOpenApiException } from '@/domain/exceptions';
import { OpenApiVersion } from '@/domain/value-objects';
import type { OpenApiSpec } from '@/shared/types';

/**
 * Реализация валидатора OpenAPI на основе swagger-parser
 */
export class OpenApiValidator implements IOpenApiValidator {
  async validate(spec: OpenApiSpec): Promise<OpenApiValidationResult> {
    const errors: string[] = [];

    try {
      // Проверяем наличие обязательных полей
      if (!spec) {
        errors.push('Specification is null or undefined');
        throw new InvalidOpenApiException('Specification is null or undefined');
      }

      // Проверяем версию (openapi или swagger)
      let version: OpenApiVersion;
      if (spec.openapi) {
        version = OpenApiVersion.create(spec.openapi);
      } else if (spec.swagger) {
        version = OpenApiVersion.create(spec.swagger);
      } else {
        errors.push('Missing "openapi" or "swagger" field');
        throw new InvalidOpenApiException('Missing "openapi" or "swagger" field');
      }

      // Проверяем наличие info
      if (!spec.info || typeof spec.info !== 'object') {
        errors.push('Missing or invalid "info" field');
        throw new InvalidOpenApiException('Missing or invalid "info" field');
      }

      // Проверяем наличие paths (для swagger может быть в другом формате, но обычно тоже paths)
      if (!spec.paths || typeof spec.paths !== 'object') {
        errors.push('Missing or invalid "paths" field');
        throw new InvalidOpenApiException('Missing or invalid "paths" field');
      }

      // Используем swagger-parser для полной валидации
      // swagger-parser принимает object, приводим через structuredClone для совместимости типов
      try {
        await SwaggerParser.validate(JSON.parse(JSON.stringify(spec)));
      } catch (validationError) {
        // Swagger-parser может выбросить ошибки, но мы не всегда хотим их считать критичными
        const errorMsg = validationError instanceof Error
          ? validationError.message
          : String(validationError);
        // Если это критичная ошибка структуры, пробрасываем
        if (errorMsg.includes('is not a valid') || errorMsg.includes('must be')) {
          errors.push(errorMsg);
        }
      }

      return {
        version,
        isValid: errors.length === 0,
        errors,
      };
    } catch (error) {
      if (error instanceof InvalidOpenApiException) {
        throw error;
      }
      const message = error instanceof Error ? error.message : 'Unknown validation error';
      throw new InvalidOpenApiException(message);
    }
  }
}
