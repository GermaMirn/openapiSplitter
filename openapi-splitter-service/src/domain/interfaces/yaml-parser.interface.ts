import type { YamlValue } from '@/shared/types';

/**
 * Интерфейс для парсинга YAML
 */
export interface IYamlParser {
  /**
   * Парсит YAML строку в JavaScript объект
   * @throws InvalidYamlException если YAML невалиден
   */
  parse(content: string): Promise<YamlValue>;

  /**
   * Сериализует JavaScript объект в YAML строку
   */
  stringify(obj: YamlValue): Promise<string>;
}
