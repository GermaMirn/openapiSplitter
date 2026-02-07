import { describe, it, expect, vi } from 'vitest';
import { DeleteFileUseCase } from '@/application/use-cases/delete-file.use-case';
import { YamlParser } from '@/infrastructure/parsers/yaml-parser';
import { FileNotFoundError } from '@/domain/exceptions';

describe('DeleteFileUseCase', () => {
  const yamlParser = new YamlParser();

  it('удаляет файл и обновляет root — убирает $ref из paths (успех)', async () => {
    const rootYaml = `openapi: 3.0.0
info:
  title: Test
  version: 1.0.0
paths:
  /health:
    $ref: "./paths/health.yaml"`;
    const rootSpec = {
      openapi: '3.0.0',
      info: { title: 'Test', version: '1.0.0' },
      paths: { '/health': { $ref: './paths/health.yaml' } },
    };
    const mockGetFile = vi.fn().mockResolvedValue({
      id: '123e4567-e89b-12d3-a456-426614174000',
      path: 'test1/paths/health.yaml',
    });
    const mockDeleteFile = vi.fn().mockResolvedValue(undefined);
    const mockGetFilesByPath = vi.fn().mockResolvedValue([
      { id: 'root-id', path: 'test1/openapi.yaml' },
    ]);
    const mockGetFileContent = vi.fn().mockResolvedValue(Buffer.from(rootYaml, 'utf-8'));
    const mockUpdateFileContent = vi.fn().mockResolvedValue(undefined);
    const mockParse = vi.spyOn(yamlParser, 'parse').mockResolvedValue(rootSpec);
    const mockStringify = vi.spyOn(yamlParser, 'stringify').mockResolvedValue('updated yaml');

    const filesServiceClient = {
      getFile: mockGetFile,
      deleteFile: mockDeleteFile,
      getFilesByPath: mockGetFilesByPath,
      getFileContent: mockGetFileContent,
      updateFileContent: mockUpdateFileContent,
    } as never;
    const useCase = new DeleteFileUseCase(filesServiceClient, yamlParser);

    await useCase.execute('123e4567-e89b-12d3-a456-426614174000');

    expect(mockDeleteFile).toHaveBeenCalledWith('123e4567-e89b-12d3-a456-426614174000');
    expect(mockGetFilesByPath).toHaveBeenCalledWith('test1');
    expect(mockGetFileContent).toHaveBeenCalledWith('root-id');
    expect(mockUpdateFileContent).toHaveBeenCalledWith('root-id', expect.any(Buffer));

    mockParse.mockRestore();
    mockStringify.mockRestore();
  });

  it('удаляет файл — updateRootFile early return при pathParts.length < 2', async () => {
    const mockGetFile = vi.fn().mockResolvedValue({
      id: '123e4567-e89b-12d3-a456-426614174000',
      path: 'test1',
    });
    const mockDeleteFile = vi.fn().mockResolvedValue(undefined);
    const mockGetFilesByPath = vi.fn().mockResolvedValue([]);

    const filesServiceClient = {
      getFile: mockGetFile,
      deleteFile: mockDeleteFile,
      getFilesByPath: mockGetFilesByPath,
    } as never;
    const useCase = new DeleteFileUseCase(filesServiceClient, yamlParser);

    await useCase.execute('123e4567-e89b-12d3-a456-426614174000');

    expect(mockDeleteFile).toHaveBeenCalled();
    expect(mockGetFilesByPath).not.toHaveBeenCalled();
  });

  it('удаляет файл — updateRootFile early return при отсутствии root file', async () => {
    const mockGetFile = vi.fn().mockResolvedValue({
      id: '123e4567-e89b-12d3-a456-426614174000',
      path: 'test1/paths/health.yaml',
    });
    const mockDeleteFile = vi.fn().mockResolvedValue(undefined);
    const mockGetFilesByPath = vi.fn().mockResolvedValue([
      { id: 'other-id', path: 'test1/other.yaml' },
    ]);

    const filesServiceClient = {
      getFile: mockGetFile,
      deleteFile: mockDeleteFile,
      getFilesByPath: mockGetFilesByPath,
    } as never;
    const useCase = new DeleteFileUseCase(filesServiceClient, yamlParser);

    await useCase.execute('123e4567-e89b-12d3-a456-426614174000');

    expect(mockDeleteFile).toHaveBeenCalled();
    expect(mockGetFilesByPath).toHaveBeenCalledWith('test1');
  });

  it('удаляет файл — updateRootFile убирает $ref из components (успех)', async () => {
    const rootSpec = {
      openapi: '3.0.0',
      info: { title: 'Test', version: '1.0.0' },
      paths: {},
      components: {
        schemas: { User: { $ref: './components/schemas/User.yaml' } },
      },
    };
    const rootYaml = 'openapi: 3.0.0';
    const mockGetFile = vi.fn().mockResolvedValue({
      id: '123e4567-e89b-12d3-a456-426614174000',
      path: 'docs/components/schemas/User.yaml',
    });
    const mockDeleteFile = vi.fn().mockResolvedValue(undefined);
    const mockGetFilesByPath = vi.fn().mockResolvedValue([
      { id: 'root-id', path: 'docs/openapi.yaml' },
    ]);
    const mockGetFileContent = vi.fn().mockResolvedValue(Buffer.from(rootYaml, 'utf-8'));
    const mockUpdateFileContent = vi.fn().mockResolvedValue(undefined);
    const mockParse = vi.spyOn(yamlParser, 'parse').mockResolvedValue(rootSpec);
    const mockStringify = vi.spyOn(yamlParser, 'stringify').mockResolvedValue('updated');

    const filesServiceClient = {
      getFile: mockGetFile,
      deleteFile: mockDeleteFile,
      getFilesByPath: mockGetFilesByPath,
      getFileContent: mockGetFileContent,
      updateFileContent: mockUpdateFileContent,
    } as never;
    const useCase = new DeleteFileUseCase(filesServiceClient, yamlParser);

    await useCase.execute('123e4567-e89b-12d3-a456-426614174000');

    expect(mockUpdateFileContent).toHaveBeenCalledWith('root-id', expect.any(Buffer));

    mockParse.mockRestore();
    mockStringify.mockRestore();
  });

  it('выбрасывает FileNotFoundError для невалидного id (ошибка)', async () => {
    const filesServiceClient = {} as never;
    const useCase = new DeleteFileUseCase(filesServiceClient, yamlParser);

    await expect(useCase.execute('invalid-uuid')).rejects.toThrow(FileNotFoundError);
  });
});
