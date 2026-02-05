import type { YamlValue } from './yaml-value';

/**
 * Типы для OpenAPI спецификации.
 */

/**
 * Базовый тип для OpenAPI объекта — словарь из строковых ключей и YAML-значений
 */
export type OpenApiObject = Record<string, YamlValue>;

/**
 * Info объект OpenAPI спецификации
 */
export interface OpenApiInfo {
  title: string;
  version: string;
  description?: string;
  termsOfService?: string;
  contact?: OpenApiObject;
  license?: OpenApiObject;
}

/**
 * OpenAPI спецификация (OpenAPI 3.x или Swagger 2.0)
 * Не наследуем от OpenApiObject чтобы избежать конфликтов индексных типов
 */
export interface OpenApiSpec {
  openapi?: string;  // OpenAPI 3.x
  swagger?: string;  // Swagger 2.0
  info: OpenApiInfo;
  paths: Record<string, OpenApiObject>;
  components?: Record<string, Record<string, OpenApiObject>>;
  servers?: OpenApiObject[];
  tags?: OpenApiObject[];
  security?: OpenApiObject[];
  externalDocs?: OpenApiObject;
  // Дополнительные поля (расширения x-*)
  [key: string]: YamlValue | OpenApiInfo | Record<string, OpenApiObject> | Record<string, Record<string, OpenApiObject>> | OpenApiObject[] | undefined;
}
