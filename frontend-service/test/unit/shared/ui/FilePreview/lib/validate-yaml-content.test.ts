import { describe, it, expect } from 'vitest';
import { validateYamlContent } from '@/shared/ui/FilePreview/lib/validate-yaml-content';

const validOpenApi = `
openapi: 3.0.0
info:
  title: Test
  version: 1.0.0
paths: {}
`;

describe('validateYamlContent', () => {
  it('принимает валидный OpenAPI 3', () => {
    expect(validateYamlContent(validOpenApi)).toEqual({ valid: true });
  });

  it('принимает Swagger 2', () => {
    const swagger = `
swagger: "2.0"
info:
  title: Test
  version: 1.0.0
paths: {}
`;
    expect(validateYamlContent(swagger)).toEqual({ valid: true });
  });

  it('отклоняет пустой файл', () => {
    expect(validateYamlContent('')).toEqual({ valid: false, error: 'Файл пуст' });
    expect(validateYamlContent('   \n\t  ')).toEqual({ valid: false, error: 'Файл пуст' });
  });

  it('отклоняет невалидный YAML', () => {
    const result = validateYamlContent('key: "unclosed');
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('отклоняет отсутствие openapi/swagger', () => {
    const yaml = `
info:
  title: Test
paths: {}
`;
    expect(validateYamlContent(yaml)).toEqual({
      valid: false,
      error: 'Не OpenAPI: нет поля openapi или swagger',
    });
  });

  it('отклоняет отсутствие info', () => {
    const yaml = `
openapi: 3.0.0
paths: {}
`;
    expect(validateYamlContent(yaml)).toEqual({
      valid: false,
      error: 'Не OpenAPI: нет обязательного поля info',
    });
  });

  it('отклоняет отсутствие paths', () => {
    const yaml = `
openapi: 3.0.0
info:
  title: Test
`;
    expect(validateYamlContent(yaml)).toEqual({
      valid: false,
      error: 'Не OpenAPI: нет обязательного поля paths',
    });
  });

  it('отклоняет не объект (число)', () => {
    expect(validateYamlContent('42')).toEqual({
      valid: false,
      error: 'Невалидная структура',
    });
  });
});
