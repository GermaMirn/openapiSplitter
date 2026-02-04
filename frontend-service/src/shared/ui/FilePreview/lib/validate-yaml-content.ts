import yaml from 'js-yaml';
import type { ValidateResult } from '../types';

/** Проверяет, что контент не пустой, валидный YAML и минимальная структура OpenAPI. */
export function validateYamlContent(content: string): ValidateResult {
  const trimmed = content.trim();
  if (trimmed === '') {
    return { valid: false, error: 'Файл пуст' };
  }
  let parsed: unknown;
  try {
    parsed = yaml.load(trimmed);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Невалидный YAML';
    return { valid: false, error: message };
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return { valid: false, error: 'Невалидная структура' };
  }
  const obj = parsed as Record<string, unknown>;
  if (!('openapi' in obj) && !('swagger' in obj)) {
    return { valid: false, error: 'Не OpenAPI: нет поля openapi или swagger' };
  }
  if (!('info' in obj)) {
    return { valid: false, error: 'Не OpenAPI: нет обязательного поля info' };
  }
  if (!('paths' in obj)) {
    return { valid: false, error: 'Не OpenAPI: нет обязательного поля paths' };
  }
  return { valid: true };
}
