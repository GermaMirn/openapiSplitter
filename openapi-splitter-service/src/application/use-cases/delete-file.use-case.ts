import { validate as uuidValidate } from 'uuid';
import type { FilesServiceClient } from '@/infrastructure/external';
import type { IYamlParser } from '@/domain/interfaces';
import { FileNotFoundError } from '@/domain/exceptions';
import type { OpenApiObject, YamlValue } from '@/shared/types';

/**
 * Use case: удаление файла
 */
export class DeleteFileUseCase {
  constructor(
    private readonly filesServiceClient: FilesServiceClient,
    private readonly yamlParser: IYamlParser
  ) {}

  async execute(id: string): Promise<void> {
    if (!id || !uuidValidate(id)) {
      throw new FileNotFoundError(`File with id ${id} not found`);
    }

    // Получаем метаданные файла перед удалением
    const file = await this.filesServiceClient.getFile(id);
    const filePath = file.path; // например "test1/paths/health.yaml"

    // Удаляем файл
    await this.filesServiceClient.deleteFile(id);

    // Обновляем корневой файл, удаляя $ref на удаленный файл
    await this.updateRootFile(filePath);
  }

  /**
   * Обновляет корневой файл документа, удаляя $ref на удаленный файл
   */
  private async updateRootFile(deletedFilePath: string): Promise<void> {
    try {
      // Извлекаем базовый путь документа (например "test1")
      const pathParts = deletedFilePath.split('/');
      if (pathParts.length < 2) return;

      const documentBasePath = pathParts[0];
      const rootFilePath = `${documentBasePath}/openapi.yaml`;

      // Получаем список всех файлов документа
      const files = await this.filesServiceClient.getFilesByPath(documentBasePath);
      const rootFile = files.find((f) => f.path === rootFilePath);
      if (!rootFile) return;

      // Загружаем содержимое корневого файла
      const rootContentBuffer = await this.filesServiceClient.getFileContent(rootFile.id);
      const rootContentYaml = rootContentBuffer.toString('utf-8');
      const rootSpec = (await this.yamlParser.parse(rootContentYaml)) as OpenApiObject;

      // Определяем относительный путь удаленного файла от корня
      // "test1/paths/health.yaml" -> "./paths/health.yaml"
      const relativeDeletedPath = './' + pathParts.slice(1).join('/');

      // Удаляем $ref из paths или components
      let modified = false;

      // Проверяем paths
      if (rootSpec.paths && typeof rootSpec.paths === 'object' && !Array.isArray(rootSpec.paths)) {
        const pathsRecord = rootSpec.paths as Record<string, unknown>;
        for (const [pathKey, pathValue] of Object.entries(pathsRecord)) {
          if (
            typeof pathValue === 'object' &&
            pathValue !== null &&
            '$ref' in pathValue &&
            (pathValue as { $ref: string }).$ref === relativeDeletedPath
          ) {
            delete pathsRecord[pathKey];
            modified = true;
          }
        }
      }

      // Проверяем components
      if (rootSpec.components && typeof rootSpec.components === 'object') {
        for (const [componentType, components] of Object.entries(rootSpec.components)) {
          if (typeof components === 'object' && components !== null) {
            for (const [componentName, componentValue] of Object.entries(components)) {
              if (
                typeof componentValue === 'object' &&
                componentValue !== null &&
                '$ref' in componentValue &&
                componentValue.$ref === relativeDeletedPath
              ) {
                delete (rootSpec.components as Record<string, Record<string, unknown>>)[componentType][componentName];
                modified = true;
              }
            }
          }
        }
      }

      // Если были изменения - сохраняем обновленный корневой файл
      if (modified) {
        const updatedContent = await this.yamlParser.stringify(rootSpec as YamlValue);
        await this.filesServiceClient.updateFileContent(rootFile.id, Buffer.from(updatedContent, 'utf-8'));
      }
    } catch (err) {
      // Логируем ошибку, но не прерываем процесс удаления
      console.error('Failed to update root file after deletion:', err);
    }
  }
}
