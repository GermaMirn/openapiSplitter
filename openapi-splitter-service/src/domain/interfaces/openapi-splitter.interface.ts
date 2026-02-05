import type { SplitResult } from '@/domain/entities';
import type { VirtualPath } from '@/domain/value-objects';
import type { OpenApiSpec } from '@/shared/types';

/**
 * Интерфейс для разрезки OpenAPI спецификации по правилам
 */
export interface IOpenApiSplitter {
  /**
   * Разрезает OpenAPI спецификацию на виртуальные файлы
   * @param spec - распарсенный объект OpenAPI спецификации
   * @param basePath - базовый путь для сохранения результата
   * @returns результат разрезки с деревом и файлами
   */
  split(spec: OpenApiSpec, basePath: VirtualPath): Promise<SplitResult>;
}
