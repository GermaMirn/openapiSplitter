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
});
