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

    // Создаём объекты для $ref
    const componentsRefs: Record<string, Record<string, { $ref: string }>> = {};
    const pathsRefs: Record<string, { $ref: string }> = {};

    // Разрезаем components
    if (spec.components && typeof spec.components === 'object') {
      const componentFiles = await this.splitComponents(spec.components, basePath, componentsRefs);
      files.push(...componentFiles);
    }

    // Разрезаем paths
    if (spec.paths && typeof spec.paths === 'object') {
      const pathFiles = await this.splitPaths(spec.paths, basePath, pathsRefs);
      files.push(...pathFiles);
    }

    // Создаём корневой файл с $ref на разрезанные части
    const rootSpec = this.createRootSpec(spec, componentsRefs, pathsRefs);
    const rootPath = VirtualPath.create(`${basePath.toString()}/openapi.yaml`);
    const rootContent = await this.yamlParser.stringify(rootSpec as YamlValue);
    files.unshift(VirtualFile.create(rootPath, rootContent, true));

    return SplitResult.create(basePath, version, files);
  }

  /**
   * Создаёт корневой файл с общими полями и ссылками на разрезанные части
   */
  private createRootSpec(
    spec: OpenApiSpec,
    componentsRefs: Record<string, Record<string, { $ref: string }>>,
    pathsRefs: Record<string, { $ref: string }>
  ): OpenApiObject {
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

    // Добавляем $ref на разрезанные части
    root.components = Object.keys(componentsRefs).length > 0 ? componentsRefs : {};
    root.paths = Object.keys(pathsRefs).length > 0 ? pathsRefs : {};

    return root;
  }

  /**
   * Разрезает секцию components
   * components/{type}/{Name}.yaml
   */
  private async splitComponents(
    components: Record<string, Record<string, OpenApiObject>>,
    basePath: VirtualPath,
    refsOut: Record<string, Record<string, { $ref: string }>>
  ): Promise<VirtualFile[]> {
    const files: VirtualFile[] = [];

    for (const componentType of Object.keys(components)) {
      const typeComponents = components[componentType];
      if (typeof typeComponents !== 'object' || typeComponents === null) continue;

      // Инициализируем объект для типа компонента
      if (!refsOut[componentType]) {
        refsOut[componentType] = {};
      }

      for (const componentName of Object.keys(typeComponents)) {
        const componentData = typeComponents[componentName];

        // Путь: components/{type}/{Name}.yaml
        const filePath = VirtualPath.create(
          `${basePath.toString()}/components/${componentType}/${componentName}.yaml`
        );

        // Относительная ссылка из корневого файла
        const relativeRef = `./components/${componentType}/${componentName}.yaml`;
        refsOut[componentType][componentName] = { $ref: relativeRef };

        // Содержимое: сам компонент
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
    basePath: VirtualPath,
    refsOut: Record<string, { $ref: string }>
  ): Promise<VirtualFile[]> {
    const files: VirtualFile[] = [];

    for (const pathUrl of Object.keys(paths)) {
      const pathData = paths[pathUrl];

      // Преобразуем URL в путь файла
      // /api/v1/resource → paths/api/v1/resource.yaml
      // /api/v1/resource/{id} → paths/api/v1/resource/{id}.yaml
      const urlPath = pathUrl.replace(/^\//, ''); // убираем начальный слеш
      const filePath = VirtualPath.create(`${basePath.toString()}/paths/${urlPath}.yaml`);

      // Относительная ссылка из корневого файла
      const relativeRef = `./paths/${urlPath}.yaml`;
      refsOut[pathUrl] = { $ref: relativeRef };

      // Содержимое: все методы для этого пути
      const content = await this.yamlParser.stringify(pathData as YamlValue);
      files.push(VirtualFile.create(filePath, content));
    }

    return files;
  }
}
