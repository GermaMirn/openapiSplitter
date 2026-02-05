import * as yaml from 'js-yaml';
import type { IYamlParser } from '@/domain/interfaces';
import type { YamlValue } from '@/shared/types';
import { InvalidYamlException } from '@/domain/exceptions';

/**
 * Реализация парсера YAML на основе js-yaml
 */
export class YamlParser implements IYamlParser {
  async parse(content: string): Promise<YamlValue> {
    try {
      const trimmed = content.trim();
      if (!trimmed) {
        throw new InvalidYamlException('YAML content is empty');
      }

      const result = yaml.load(trimmed, {
        json: true, // строгий режим JSON совместимости
      });

      if (!result || typeof result !== 'object') {
        throw new InvalidYamlException('YAML must be an object');
      }

      return result as YamlValue;
    } catch (error) {
      if (error instanceof InvalidYamlException) {
        throw error;
      }
      const message = error instanceof Error ? error.message : 'Unknown YAML parsing error';
      throw new InvalidYamlException(`Failed to parse YAML: ${message}`);
    }
  }

  async stringify(obj: YamlValue): Promise<string> {
    try {
      return yaml.dump(obj, {
        indent: 2,
        lineWidth: 120,
        noRefs: true, // избегаем YAML anchors/aliases
        sortKeys: false,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown YAML stringify error';
      throw new Error(`Failed to stringify YAML: ${message}`);
    }
  }
}
