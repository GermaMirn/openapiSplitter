import { describe, it, expect } from 'vitest';
import { YamlParser } from '@/infrastructure/parsers/yaml-parser';
import { InvalidYamlException } from '@/domain/exceptions';

describe('YamlParser', () => {
  const parser = new YamlParser();

  it('парсит валидный YAML (успех)', async () => {
    const yaml = `openapi: 3.0.0
info:
  title: Test API
  version: 1.0.0
paths: {}`;
    const result = (await parser.parse(yaml)) as Record<string, null>;

    expect(result.openapi).toBe('3.0.0');
    expect(result.info).toBeDefined();
  });

  it('stringify сериализует объект в YAML (успех)', async () => {
    const obj = { openapi: '3.0.0', info: { title: 'Test', version: '1.0.0' } };
    const result = await parser.stringify(obj);

    expect(typeof result).toBe('string');
    expect(result).toContain('openapi');
  });

  it('roundtrip parse -> stringify -> parse (успех)', async () => {
    const original = { openapi: '3.0.0', info: { title: 'Test', version: '1.0.0' }, paths: {} };
    const str = await parser.stringify(original);
    const parsed = (await parser.parse(str)) as typeof original;

    expect(parsed).toEqual(original);
  });

  it('выбрасывает InvalidYamlException для пустого контента (ошибка)', async () => {
    await expect(parser.parse('')).rejects.toThrow(InvalidYamlException);
  });

  it('выбрасывает InvalidYamlException когда результат не объект (ошибка)', async () => {
    await expect(parser.parse('42')).rejects.toThrow(InvalidYamlException);
  });
});
