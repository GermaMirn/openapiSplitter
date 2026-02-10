import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FileSystemStorage } from '@/infrastructure/storage/file-system-storage';
import { FilePath } from '@/domain/value-objects';

const mockMkdir = vi.fn();
const mockWriteFile = vi.fn();
const mockReadFile = vi.fn();
const mockUnlink = vi.fn();

vi.mock('node:fs/promises', () => ({
  mkdir: (...args: unknown[]) => mockMkdir(...args),
  writeFile: (...args: unknown[]) => mockWriteFile(...args),
  readFile: (...args: unknown[]) => mockReadFile(...args),
  unlink: (...args: unknown[]) => mockUnlink(...args),
}));

describe('FileSystemStorage', () => {
  const basePath = '/tmp/test-storage';
  let storage: FileSystemStorage;

  beforeEach(() => {
    storage = new FileSystemStorage(basePath);
    vi.clearAllMocks();
    mockMkdir.mockResolvedValue(undefined);
    mockWriteFile.mockResolvedValue(undefined);
    mockReadFile.mockResolvedValue(Buffer.from('file content'));
    mockUnlink.mockResolvedValue(undefined);
  });

  describe('constructor', () => {
    it('использует config.storage.path когда baseDir не передан (branch)', async () => {
      const storageDefault = new FileSystemStorage();
      await storageDefault.save(FilePath.create('default.txt'), Buffer.from('x'));
      expect(mockMkdir).toHaveBeenCalled();
      expect(mockWriteFile).toHaveBeenCalledWith(
        expect.stringMatching(/default\.txt$/),
        Buffer.from('x')
      );
    });
  });

  describe('save', () => {
    it('создаёт директорию рекурсивно и записывает файл', async () => {
      const filePath = FilePath.create('docs/openapi.yaml');
      const content = Buffer.from('content');

      await storage.save(filePath, content);

      expect(mockMkdir).toHaveBeenCalledWith('/tmp/test-storage/docs', { recursive: true });
      expect(mockWriteFile).toHaveBeenCalledWith('/tmp/test-storage/docs/openapi.yaml', content);
    });

    it('при пути без вложенных папок создаёт только basePath', async () => {
      const filePath = FilePath.create('root.yaml');
      await storage.save(filePath, Buffer.from('x'));

      expect(mockMkdir).toHaveBeenCalledWith(basePath, { recursive: true });
      expect(mockWriteFile).toHaveBeenCalledWith(`${basePath}/root.yaml`, Buffer.from('x'));
    });
  });

  describe('read', () => {
    it('читает файл по пути и возвращает Buffer', async () => {
      const filePath = FilePath.create('docs/openapi.yaml');
      const data = Buffer.from('yaml content');
      mockReadFile.mockResolvedValue(data);

      const result = await storage.read(filePath);

      expect(mockReadFile).toHaveBeenCalledWith('/tmp/test-storage/docs/openapi.yaml');
      expect(result).toEqual(data);
    });
  });

  describe('delete', () => {
    it('удаляет файл по полному пути', async () => {
      const filePath = FilePath.create('docs/openapi.yaml');

      await storage.delete(filePath);

      expect(mockUnlink).toHaveBeenCalledWith('/tmp/test-storage/docs/openapi.yaml');
    });
  });
});
