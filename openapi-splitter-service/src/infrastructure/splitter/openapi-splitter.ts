import type { IOpenApiSplitter, IYamlParser } from '@/domain/interfaces';
import { SplitResult, VirtualFile } from '@/domain/entities';
import { VirtualPath, OpenApiVersion } from '@/domain/value-objects';
import type { OpenApiSpec, OpenApiObject, YamlValue } from '@/shared/types';

/**
 * Реализация разрезки OpenAPI спецификации по правилам ТЗ
 */
export class OpenApiSplitter implements IOpenApiSplitter {
  constructor(private readonly yamlParser: IYamlParser) {}

  async split(spec: OpenApiSpec, basePath: VirtualPath): Promise<SplitResult> {
    const files: VirtualFile[] = [];
    const version = spec.openapi
      ? OpenApiVersion.create(spec.openapi)
      : OpenApiVersion.create(spec.swagger as string);

    // Создаём корневой файл с общими полями
    const rootSpec = this.createRootSpec(spec);
    const rootPath = VirtualPath.create(`${basePath.toString()}/openapi.yaml`);
    const rootContent = await this.yamlParser.stringify(rootSpec as YamlValue);
    files.push(VirtualFile.create(rootPath, rootContent, true));

    // Разрезаем components
    if (spec.components && typeof spec.components === 'object') {
      const componentFiles = await this.splitComponents(spec.components, basePath);
      files.push(...componentFiles);
    }

    // Разрезаем paths
    if (spec.paths && typeof spec.paths === 'object') {
      const pathFiles = await this.splitPaths(spec.paths, basePath);
      files.push(...pathFiles);
    }

    return SplitResult.create(basePath, version, files);
  }

  /**
   * Создаёт корневой файл с общими полями
   * Всё, что не components и не paths, остаётся здесь
   */
  private createRootSpec(spec: OpenApiSpec): OpenApiObject {
    const root: OpenApiObject = {};

    // Копируем все поля, кроме components и paths
    for (const key of Object.keys(spec)) {
      if (key !== 'components' && key !== 'paths') {
        const value = spec[key];
        // Пропускаем undefined значения
        if (value !== undefined) {
          root[key] = value as YamlValue;
        }
      }
    }

    // Добавляем пустые объекты для ссылок (будут заполнены абсолютными $ref)
    root.components = {};
    root.paths = {};

    return root;
  }

  /**
   * Разрезает секцию components
   * components/{type}/{Name}.yaml
   */
  private async splitComponents(
    components: Record<string, Record<string, OpenApiObject>>,
    basePath: VirtualPath
  ): Promise<VirtualFile[]> {
    const files: VirtualFile[] = [];

    for (const componentType of Object.keys(components)) {
      const typeComponents = components[componentType];
      if (typeof typeComponents !== 'object' || typeComponents === null) continue;

      for (const componentName of Object.keys(typeComponents)) {
        const componentData = typeComponents[componentName];
        
        // Путь: components/{type}/{Name}.yaml
        const filePath = VirtualPath.create(
          `${basePath.toString()}/components/${componentType}/${componentName}.yaml`
        );

        // Содержимое: сам компонент с абсолютным $ref на себя
        const content = await this.yamlParser.stringify(componentData as YamlValue);
        files.push(VirtualFile.create(filePath, content));
      }
    }

    return files;
  }

  /**
   * Разрезает секцию paths
   * Структура директорий повторяет URL-путь
   */
  private async splitPaths(
    paths: Record<string, OpenApiObject>,
    basePath: VirtualPath
  ): Promise<VirtualFile[]> {
    const files: VirtualFile[] = [];

    for (const pathUrl of Object.keys(paths)) {
      const pathData = paths[pathUrl];
      
      // Преобразуем URL в путь файла
      // /api/v1/resource → paths/api/v1/resource.yaml
      // /api/v1/resource/{id} → paths/api/v1/resource/{id}.yaml
      const urlPath = pathUrl.replace(/^\//, ''); // убираем начальный слеш
      const filePath = VirtualPath.create(
        `${basePath.toString()}/paths/${urlPath}.yaml`
      );

      // Содержимое: все методы для этого пути
      const content = await this.yamlParser.stringify(pathData as YamlValue);
      files.push(VirtualFile.create(filePath, content));
    }

    return files;
  }
}
