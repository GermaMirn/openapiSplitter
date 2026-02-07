import { describe, it, expect } from 'vitest';
import { OpenApiSplitter } from '@/infrastructure/splitter/openapi-splitter';
import { YamlParser } from '@/infrastructure/parsers/yaml-parser';
import { VirtualPath } from '@/domain/value-objects';

describe('OpenApiSplitter', () => {
  const yamlParser = new YamlParser();
  const splitter = new OpenApiSplitter(yamlParser);

  it('разрезает минимальную спецификацию (успех)', async () => {
    const spec = {
      openapi: '3.0.0',
      info: { title: 'Test', version: '1.0.0' },
      paths: {
        '/health': {
          get: { summary: 'Health check', responses: { '200': { description: 'OK' } } },
        },
      },
    };
    const basePath = VirtualPath.create('docs/api');

    const result = await splitter.split(spec, basePath);

    expect(result.files.length).toBeGreaterThan(0);
    expect(result.getRootFile()).toBeDefined();
    expect(result.version.toString()).toBe('3.0.0');
  });

  it('поддерживает Swagger 2.0 (успех)', async () => {
    const spec = {
      swagger: '2.0',
      info: { title: 'Test', version: '1.0.0' },
      paths: { '/users': { get: {} } },
    };
    const basePath = VirtualPath.create('docs');

    const result = await splitter.split(spec, basePath);

    expect(result.version.toString()).toBe('2.0');
    expect(result.version.isSwagger()).toBe(true);
  });

  it('разрезает components/schemas (успех)', async () => {
    const spec = {
      openapi: '3.0.0',
      info: { title: 'Test', version: '1.0.0' },
      paths: {},
      components: {
        schemas: {
          User: { type: 'object', properties: { id: { type: 'string' } } },
        },
      },
    };
    const basePath = VirtualPath.create('docs');

    const result = await splitter.split(spec, basePath);

    const map = result.toFilesMap();
    expect(Object.keys(map)).toContain('docs/components/schemas/User.yaml');
  });
});
