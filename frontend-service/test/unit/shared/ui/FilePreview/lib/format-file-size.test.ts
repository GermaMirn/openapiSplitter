import { describe, it, expect } from 'vitest';
import { formatFileSize } from '@/shared/ui/FilePreview/lib/format-file-size';

describe('formatFileSize', () => {
  it('форматирует байты', () => {
    expect(formatFileSize(0)).toBe('0 Б');
    expect(formatFileSize(500)).toBe('500 Б');
  });

  it('форматирует килобайты', () => {
    expect(formatFileSize(1024)).toBe('1.0 КБ');
    expect(formatFileSize(2048)).toBe('2.0 КБ');
  });

  it('форматирует мегабайты', () => {
    expect(formatFileSize(1024 * 1024)).toBe('1.0 МБ');
    expect(formatFileSize(2.5 * 1024 * 1024)).toBe('2.5 МБ');
  });

  it('граница между Б и КБ', () => {
    expect(formatFileSize(1023)).toBe('1023 Б');
  });

  it('граница между КБ и МБ', () => {
    expect(formatFileSize(1024 * 1024 - 1)).toBe('1024.0 КБ');
  });
});
