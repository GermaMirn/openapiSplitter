import { DomainException } from '@/domain/exceptions';

/**
 * Value Object для версии OpenAPI спецификации
 */
export class OpenApiVersion {
  private constructor(private readonly value: string) {}

  static create(version: string): OpenApiVersion {
    const trimmed = version.trim();

    // Поддерживаем OpenAPI 3.x и Swagger 2.0
    if (!trimmed.match(/^(3\.\d+\.\d+|2\.0)$/)) {
      throw new DomainException(
        `Unsupported OpenAPI version: ${version}. Supported: 3.x.x or 2.0 (Swagger)`,
        'UNSUPPORTED_OPENAPI_VERSION',
        400
      );
    }

    return new OpenApiVersion(trimmed);
  }

  toString(): string {
    return this.value;
  }

  equals(other: OpenApiVersion): boolean {
    return this.value === other.value;
  }

  isSwagger(): boolean {
    return this.value === '2.0';
  }

  isOpenApi3(): boolean {
    return this.value.startsWith('3.');
  }
}
