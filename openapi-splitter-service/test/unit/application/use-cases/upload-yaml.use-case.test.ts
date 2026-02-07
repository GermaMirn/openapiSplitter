import { describe, it, expect, vi } from 'vitest';
import { UploadYamlUseCase } from '@/application/use-cases/upload-yaml.use-case';
import { YamlParser } from '@/infrastructure/parsers/yaml-parser';
import { OpenApiValidator } from '@/infrastructure/validators/openapi-validator';
import { OpenApiSplitter } from '@/infrastructure/splitter/openapi-splitter';
import { TreeBuilder } from '@/infrastructure/tree/tree-builder';
import { DomainException, SpecificationTooLargeException } from '@/domain/exceptions';

const createMockFilesServiceClient = (overrides = {}) => ({
  deleteFilesByPath: vi.fn().mockResolvedValue(undefined),
  uploadFile: vi.fn((_buffer: Buffer, path: string, _fileName: string) =>
    Promise.resolve({
      id: 'f1',
      path,
      size: 0,
      originalName: 'api.yaml',
      mimeType: null,
      createdAt: new Date().toISOString(),
    })
  ),
  ...overrides,
});

describe('UploadYamlUseCase', () => {
  const yamlParser = new YamlParser();
  const openApiValidator = new OpenApiValidator();
  const openApiSplitter = new OpenApiSplitter(yamlParser);
  const treeBuilder = new TreeBuilder();

  it('успешно загружает и разрезает спецификацию (успех)', async () => {
    const yaml = `openapi: 3.0.0
info:
  title: Test
  version: 1.0.0
paths:
  /health:
    get: {}`;
    const filesServiceClient = createMockFilesServiceClient() as never;
    const useCase = new UploadYamlUseCase(
      yamlParser,
      openApiValidator,
      openApiSplitter,
      filesServiceClient,
      treeBuilder
    );

    const result = await useCase.execute({
      content: yaml,
      originalName: 'api.yaml',
    });

    expect(result.rootFile).toBeDefined();
    expect(result.tree).toHaveLength(1);
    expect(result.totalFiles).toBeGreaterThan(0);
  });

  it('выбрасывает DomainException если нет content и buffer (ошибка)', async () => {
    const filesServiceClient = createMockFilesServiceClient() as never;
    const useCase = new UploadYamlUseCase(
      yamlParser,
      openApiValidator,
      openApiSplitter,
      filesServiceClient,
      treeBuilder
    );

    await expect(useCase.execute({ originalName: 'test.yaml' } as never)).rejects.toThrow(
      DomainException
    );
  });

  it('выбрасывает SpecificationTooLargeException при превышении размера (ошибка)', async () => {
    const largeBuffer = Buffer.alloc(51 * 1024 * 1024);
    const filesServiceClient = createMockFilesServiceClient() as never;
    const useCase = new UploadYamlUseCase(
      yamlParser,
      openApiValidator,
      openApiSplitter,
      filesServiceClient,
      treeBuilder
    );

    await expect(
      useCase.execute({ buffer: largeBuffer, originalName: 'large.yaml' })
    ).rejects.toThrow(SpecificationTooLargeException);
  });

  it('выбрасывает DomainException при невалидной OpenAPI (ошибка)', async () => {
    const invalidYaml = `openapi: 3.0.0
info:
  title: Test
  version: 1.0.0
paths:
  /path: null`;
    const filesServiceClient = createMockFilesServiceClient() as never;
    const useCase = new UploadYamlUseCase(
      yamlParser,
      openApiValidator,
      openApiSplitter,
      filesServiceClient,
      treeBuilder
    );

    await expect(
      useCase.execute({ content: invalidYaml, originalName: 'api.yaml' })
    ).rejects.toThrow(DomainException);
  });

  it('использует extractFileNameWithoutExt при отсутствии path (успех)', async () => {
    const yaml = `openapi: 3.0.0
info:
  title: Test
  version: 1.0.0
paths:
  /health:
    get: {}`;
    const mockDeleteFilesByPath = vi.fn().mockResolvedValue(undefined);
    const mockUploadFile = vi.fn((_b: Buffer, path: string) =>
      Promise.resolve({
        id: 'f1',
        path,
        size: 0,
        originalName: 'api.yaml',
        mimeType: null,
        createdAt: new Date().toISOString(),
      })
    );
    const filesServiceClient = createMockFilesServiceClient({
      deleteFilesByPath: mockDeleteFilesByPath,
      uploadFile: mockUploadFile,
    }) as never;
    const useCase = new UploadYamlUseCase(
      yamlParser,
      openApiValidator,
      openApiSplitter,
      filesServiceClient,
      treeBuilder
    );

    const result = await useCase.execute({
      content: yaml,
      originalName: 'api.yaml',
    });

    expect(result.rootFile).toBeDefined();
    expect(mockDeleteFilesByPath).toHaveBeenCalledWith('api');
  });

  it('выбрасывает при падении deleteFilesByPath (ошибка)', async () => {
    const yaml = `openapi: 3.0.0
info:
  title: Test
  version: 1.0.0
paths:
  /health:
    get: {}`;
    const filesServiceClient = createMockFilesServiceClient({
      deleteFilesByPath: vi.fn().mockRejectedValue(new Error('Delete failed')),
    }) as never;
    const useCase = new UploadYamlUseCase(
      yamlParser,
      openApiValidator,
      openApiSplitter,
      filesServiceClient,
      treeBuilder
    );

    await expect(
      useCase.execute({ content: yaml, originalName: 'api.yaml' })
    ).rejects.toThrow('Delete failed');
  });

  it('выбрасывает при падении deleteFilesByPath (non-Error reject)', async () => {
    const yaml = `openapi: 3.0.0
info:
  title: Test
  version: 1.0.0
paths:
  /health:
    get: {}`;
    const filesServiceClient = createMockFilesServiceClient({
      deleteFilesByPath: vi.fn().mockRejectedValue('string error'),
    }) as never;
    const useCase = new UploadYamlUseCase(
      yamlParser,
      openApiValidator,
      openApiSplitter,
      filesServiceClient,
      treeBuilder
    );

    await expect(
      useCase.execute({ content: yaml, originalName: 'api.yaml' })
    ).rejects.toBe('string error');
  });

  it('выбрасывает DomainException если rootFile не найден (ошибка)', async () => {
    const yaml = `openapi: 3.0.0
info:
  title: Test
  version: 1.0.0
paths:
  /health:
    get: {}`;
    const mockUploadFile = vi.fn((_b: Buffer, path: string) =>
      Promise.resolve({
        id: 'f1',
        path: path.replace(/openapi\.yaml$/, 'other.yaml'),
        size: 0,
        originalName: 'api.yaml',
        mimeType: null,
        createdAt: new Date().toISOString(),
      })
    );
    const filesServiceClient = createMockFilesServiceClient({
      uploadFile: mockUploadFile,
    }) as never;
    const useCase = new UploadYamlUseCase(
      yamlParser,
      openApiValidator,
      openApiSplitter,
      filesServiceClient,
      treeBuilder
    );

    await expect(
      useCase.execute({ content: yaml, originalName: 'api.yaml' })
    ).rejects.toThrow(DomainException);
  });
});
