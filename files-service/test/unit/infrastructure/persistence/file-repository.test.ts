import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FileRepository } from '@/infrastructure/persistence/file-repository';
import { File } from '@/domain/entities';
import { FileId, FilePath } from '@/domain/value-objects';

const mockUpsert = vi.fn();
const mockFindUnique = vi.fn();
const mockFindMany = vi.fn();
const mockDeleteMany = vi.fn();
const mockUpdate = vi.fn();

vi.mock('@/infrastructure/database', () => ({
  prisma: {
    file: {
      upsert: (...args: unknown[]) => mockUpsert(...args),
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
      findMany: (...args: unknown[]) => mockFindMany(...args),
      deleteMany: (...args: unknown[]) => mockDeleteMany(...args),
      update: (...args: unknown[]) => mockUpdate(...args),
    },
  },
}));

const row = (overrides: Partial<{
  id: string;
  path: string;
  original_name: string;
  size: bigint;
  mime_type: string | null;
  created_at: Date;
}> = {}) => ({
  id: '11111111-1111-4111-a111-111111111111',
  path: 'docs/openapi.yaml',
  original_name: 'openapi.yaml',
  size: BigInt(1024),
  mime_type: 'application/yaml',
  created_at: new Date('2025-01-01T00:00:00Z'),
  ...overrides,
});

describe('FileRepository', () => {
  let repo: FileRepository;

  beforeEach(() => {
    repo = new FileRepository();
    vi.clearAllMocks();
  });

  describe('save', () => {
    it('вызывает upsert с полями файла (create/update)', async () => {
      const file = File.create(
        FileId.fromString('11111111-1111-4111-a111-111111111111'),
        FilePath.create('docs/openapi.yaml'),
        'openapi.yaml',
        1024,
        'application/yaml'
      );
      mockUpsert.mockResolvedValue(undefined);

      await repo.save(file);

      expect(mockUpsert).toHaveBeenCalledTimes(1);
      const call = mockUpsert.mock.calls[0][0];
      expect(call.where).toEqual({ id: file.id.toString() });
      expect(call.create).toEqual({
        id: file.id.toString(),
        path: file.path.toString(),
        original_name: file.originalName,
        size: BigInt(file.size),
        mime_type: file.mimeType,
        created_at: file.createdAt,
      });
      expect(call.update).toEqual({
        path: file.path.toString(),
        original_name: file.originalName,
        size: BigInt(file.size),
        mime_type: file.mimeType,
      });
    });
  });

  describe('findById', () => {
    it('возвращает null если запись не найдена', async () => {
      mockFindUnique.mockResolvedValue(null);
      const id = FileId.fromString('11111111-1111-4111-a111-111111111111');

      const result = await repo.findById(id);

      expect(result).toBeNull();
      expect(mockFindUnique).toHaveBeenCalledWith({ where: { id: id.toString() } });
    });

    it('возвращает File из строки БД', async () => {
      const id = FileId.fromString('11111111-1111-4111-a111-111111111111');
      mockFindUnique.mockResolvedValue(row({ id: id.toString() }));

      const result = await repo.findById(id);

      expect(result).not.toBeNull();
      expect(result!.id.toString()).toBe(id.toString());
      expect(result!.path.toString()).toBe('docs/openapi.yaml');
      expect(result!.originalName).toBe('openapi.yaml');
      expect(result!.size).toBe(1024);
      expect(result!.mimeType).toBe('application/yaml');
    });
  });

  describe('findByPath', () => {
    it('возвращает null если запись не найдена', async () => {
      mockFindUnique.mockResolvedValue(null);
      const path = FilePath.create('docs/openapi.yaml');

      const result = await repo.findByPath(path);

      expect(result).toBeNull();
      expect(mockFindUnique).toHaveBeenCalledWith({ where: { path: path.toString() } });
    });

    it('возвращает File если запись найдена', async () => {
      const path = FilePath.create('docs/openapi.yaml');
      mockFindUnique.mockResolvedValue(row({ path: path.toString() }));

      const result = await repo.findByPath(path);

      expect(result).not.toBeNull();
      expect(result!.path.toString()).toBe(path.toString());
    });
  });

  describe('findAll', () => {
    it('возвращает маппинг всех строк в File[]', async () => {
      mockFindMany.mockResolvedValue([row(), row({ id: '22222222-2222-4222-a222-222222222222', path: 'other.yaml' })]);

      const result = await repo.findAll();

      expect(mockFindMany).toHaveBeenCalledWith({ orderBy: { path: 'asc' } });
      expect(result).toHaveLength(2);
      expect(result[0].path.toString()).toBe('docs/openapi.yaml');
      expect(result[1].path.toString()).toBe('other.yaml');
    });
  });

  describe('delete', () => {
    it('вызывает deleteMany по id', async () => {
      mockDeleteMany.mockResolvedValue({ count: 1 });
      const id = FileId.fromString('11111111-1111-4111-a111-111111111111');

      await repo.delete(id);

      expect(mockDeleteMany).toHaveBeenCalledWith({ where: { id: id.toString() } });
    });
  });

  describe('findManyByPathPrefix', () => {
    it('добавляет слэш к префиксу и строит OR: startsWith + точное совпадение', async () => {
      mockFindMany.mockResolvedValue([row()]);

      await repo.findManyByPathPrefix('docs');

      expect(mockFindMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { path: { startsWith: 'docs/' } },
            { path: 'docs' },
          ],
        },
        orderBy: { path: 'asc' },
      });
    });

    it('если префикс уже со слэшем — не дублирует слэш в startsWith', async () => {
      mockFindMany.mockResolvedValue([]);

      await repo.findManyByPathPrefix('docs/');

      expect(mockFindMany).toHaveBeenCalledWith({
        where: {
          OR: [{ path: { startsWith: 'docs/' } }],
        },
        orderBy: { path: 'asc' },
      });
    });
  });

  describe('deleteManyByPathPrefix', () => {
    it('вызывает deleteMany с тем же OR-условием что и findManyByPathPrefix', async () => {
      mockDeleteMany.mockResolvedValue({ count: 2 });

      await repo.deleteManyByPathPrefix('docs');

      expect(mockDeleteMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { path: { startsWith: 'docs/' } },
            { path: 'docs' },
          ],
        },
      });
    });

    it('при префиксе со слэшем не добавляет точное совпадение path (branch 74-79)', async () => {
      mockDeleteMany.mockResolvedValue({ count: 1 });

      await repo.deleteManyByPathPrefix('docs/');

      expect(mockDeleteMany).toHaveBeenCalledWith({
        where: {
          OR: [{ path: { startsWith: 'docs/' } }],
        },
      });
    });
  });

  describe('updateSize', () => {
    it('вызывает update с size в BigInt', async () => {
      mockUpdate.mockResolvedValue(row());

      await repo.updateSize('11111111-1111-4111-a111-111111111111', 2048);

      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: '11111111-1111-4111-a111-111111111111' },
        data: { size: BigInt(2048) },
      });
    });
  });
});
