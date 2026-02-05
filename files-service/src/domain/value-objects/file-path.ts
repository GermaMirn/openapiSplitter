import { DomainException } from '@/domain/exceptions';

export class FilePath {
  private constructor(private readonly value: string) {}

  static create(path: string): FilePath {
    // нормализация
    const normalized = path
      .replace(/\\/g, '/')
      .replace(/\/+/g, '/')
      .replace(/^\//, '');

    // валидация
    if (!normalized.length) {
      throw new DomainException('File path cannot be empty', 'INVALID_FILE_PATH', 400);
    }
    if (normalized.includes('..')) {
      throw new DomainException('File path cannot contain ..', 'INVALID_FILE_PATH', 400);
    }
    if (normalized.length > 2048) {
      throw new DomainException('File path too long', 'INVALID_FILE_PATH', 400);
    }

    return new FilePath(normalized);
  }

  toString(): string {
    return this.value;
  }

  equals(other: FilePath): boolean {
    return this.value === other.value;
  }
}
