import { DomainException } from '@/domain/exceptions';

/**
 * Value Object для виртуального пути файла в результате разрезки
 * Например: paths/api/v1/users.yaml, components/schemas/User.yaml
*/
export class VirtualPath {
  private constructor(private readonly value: string) {}

  static create(path: string): VirtualPath {
    // нормализация
    const normalized = path
      .replace(/\\/g, '/')
      .replace(/\/+/g, '/')
      .replace(/^\//, '');

    // валидация
    if (!normalized.length) {
      throw new DomainException('Virtual path cannot be empty', 'INVALID_VIRTUAL_PATH', 400);
    }
    if (normalized.includes('..')) {
      throw new DomainException('Virtual path cannot contain ..', 'INVALID_VIRTUAL_PATH', 400);
    }
    if (normalized.length > 2048) {
      throw new DomainException('Virtual path too long', 'INVALID_VIRTUAL_PATH', 400);
    }

    return new VirtualPath(normalized);
  }

  toString(): string {
    return this.value;
  }

  equals(other: VirtualPath): boolean {
    return this.value === other.value;
  }

  getDocumentPath(): string {
    const parts = this.value.split('/');
    // Убираем openapi.yaml, если есть
    if (parts[parts.length - 1] === 'openapi.yaml') {
      parts.pop();
    }
    return parts.join('/') || '';
  }
}
