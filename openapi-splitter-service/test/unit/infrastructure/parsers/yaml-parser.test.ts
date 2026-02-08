import { describe, it, expect, vi } from 'vitest';
import * as yaml from 'js-yaml';
import { YamlParser } from '@/infrastructure/parsers/yaml-parser';
import { InvalidYamlException } from '@/domain/exceptions';

vi.mock('js-yaml', async (importOriginal) => {
  const mod = await importOriginal<typeof import('js-yaml')>();
  return {
    load: vi.fn((...args: unknown[]) => (mod as { load: (content: string, opts?: unknown) => unknown }).load(...(args as [string, unknown]))),
    dump: vi.fn((...args: unknown[]) => (mod as { dump: (obj: unknown, opts?: unknown) => unknown }).dump(...(args as [unknown, unknown]))),
  };
});

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

  it('выбрасывает InvalidYamlException при невалидном YAML-синтаксисе (ошибка)', async () => {
    await expect(parser.parse('key: "unclosed string')).rejects.toThrow(InvalidYamlException);
  });

  it('stringify выбрасывает Error при несериализуемом значении (ошибка)', async () => {
    const obj = { fn: () => {} } as unknown as Parameters<typeof parser.stringify>[0];
    await expect(parser.stringify(obj)).rejects.toThrow(/Failed to stringify YAML/);
  });

  it('parse при ошибке не-InvalidYamlException использует message или Unknown (branch)', async () => {
    vi.mocked(yaml.load).mockImplementationOnce(() => {
      throw 'non-Error throw';
    });
    await expect(parser.parse('valid: yaml')).rejects.toThrow(/Failed to parse YAML: Unknown YAML parsing error/);
  });

  it('stringify при ошибке не-Error использует Unknown stringify error (branch)', async () => {
    vi.mocked(yaml.dump).mockImplementationOnce(() => {
      throw 'string error';
    });
    await expect(parser.stringify({ a: 1 })).rejects.toThrow(/Unknown YAML stringify error/);
  });
});
