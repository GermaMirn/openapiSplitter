import { v4 as uuidv4, validate as uuidValidate } from 'uuid';
import { DomainException } from '@/domain/exceptions';

export class FileId {
  private constructor(private readonly value: string) {}

  static create(): FileId {
    return new FileId(uuidv4());
  }

  static fromString(id: string): FileId {
    if (!id || !uuidValidate(id)) {
      throw new DomainException(`Invalid file id: ${id}`, 'INVALID_FILE_ID', 400);
    }
    return new FileId(id);
  }

  toString(): string {
    return this.value;
  }

  equals(other: FileId): boolean {
    return this.value === other.value;
  }
}
