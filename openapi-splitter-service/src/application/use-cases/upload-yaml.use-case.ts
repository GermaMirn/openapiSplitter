import type { IYamlParser, IOpenApiValidator, IOpenApiSplitter } from '@/domain/interfaces';
import type { ITreeBuilder } from '@/application/interfaces';
import type { FilesServiceClient } from '@/infrastructure/external';
import type { UploadYamlInput, UploadYamlResponse } from '@/application/dto';
import { VirtualPath } from '@/domain/value-objects';
import { DomainException, SpecificationTooLargeException } from '@/domain/exceptions';
import type { OpenApiSpec } from '@/shared/types';
import { logger } from '@/shared/utils/logger';

const MAX_SPEC_SIZE = 50 * 1024 * 1024; // 50 MB

/**
 * Use case: загрузка и разрезка OpenAPI спецификации
 */
export class UploadYamlUseCase {
  constructor(
    private readonly yamlParser: IYamlParser,
    private readonly openApiValidator: IOpenApiValidator,
    private readonly openApiSplitter: IOpenApiSplitter,
    private readonly filesServiceClient: FilesServiceClient,
    private readonly treeBuilder: ITreeBuilder
  ) {}

  async execute(input: UploadYamlInput): Promise<UploadYamlResponse> {
    // 1. Получаем контент
    let content: string;
    if (input.content) {
      content = input.content;
    } else if (input.buffer) {
      if (input.buffer.length > MAX_SPEC_SIZE) {
        throw new SpecificationTooLargeException(
          `Specification size (${input.buffer.length} bytes) exceeds limit (${MAX_SPEC_SIZE} bytes)`
        );
      }
      content = input.buffer.toString('utf-8');
    } else {
      throw new DomainException('Either content or buffer must be provided', 'INVALID_INPUT', 400);
    }

    // 2. Парсим YAML и приводим к типу OpenApiSpec
    // После валидации мы уверены, что структура соответствует OpenAPI
    const parsedYaml = await this.yamlParser.parse(content);
    const spec = parsedYaml as OpenApiSpec;

    // 3. Валидируем OpenAPI
    const validationResult = await this.openApiValidator.validate(spec);
    if (!validationResult.isValid && validationResult.errors.length > 0) {
      throw new DomainException(
        `OpenAPI validation failed: ${validationResult.errors.join(', ')}`,
        'VALIDATION_FAILED',
        400
      );
    }

    // 4. Определяем базовый путь для сохранения
    // Если path указан, используем его; иначе создаём папку по имени файла
    const basePath = input.path
      ? VirtualPath.create(input.path)
      : VirtualPath.create(this.extractFileNameWithoutExt(input.originalName));

    // 5. Удаляем старые файлы по этому пути (если есть)
    try {
      await this.filesServiceClient.deleteFilesByPath(basePath.toString());
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.warn(`Failed to delete existing files by path before upload: ${message}`, {
        path: basePath.toString(),
      });
      throw error;
    }

    // 6. Разрезаем спецификацию
    const splitResult = await this.openApiSplitter.split(spec, basePath);

    // 7. Сохраняем все файлы в files-service
    const uploadedFiles = [];
    for (const virtualFile of splitResult.files) {
      const buffer = Buffer.from(virtualFile.content, 'utf-8');
      const fileName = virtualFile.path.toString().split('/').pop() || 'file.yaml';

      const uploaded = await this.filesServiceClient.uploadFile(
        buffer,
        virtualFile.path.toString(),
        fileName
      );
      uploadedFiles.push(uploaded);
    }

    // 8. Находим корневой файл
    const rootFile = uploadedFiles.find((f) => f.path.endsWith('/openapi.yaml'));
    if (!rootFile) {
      throw new DomainException('Root file not found in uploaded files', 'ROOT_FILE_NOT_FOUND', 500);
    }

    // 9. Строим дерево (передаём оригинальное имя файла для label документа)
    const tree = this.treeBuilder.buildTree(uploadedFiles, input.originalName);

    return {
      rootFile: {
        id: rootFile.id,
        path: rootFile.path,
        originalName: input.originalName, // Оригинальное имя загруженного файла
        size: rootFile.size,
        createdAt: rootFile.createdAt,
      },
      tree,
      totalFiles: uploadedFiles.length,
    };
  }

  /**
   * Извлекает имя файла без расширения
   */
  private extractFileNameWithoutExt(fileName: string): string {
    const name = fileName.split('/').pop() || fileName;
    return name.replace(/\.(yaml|yml|json)$/i, '') || name;
  }
}
