import { describe, it, expect } from 'vitest';
import { getUploadErrorMessage } from '@/features/upload-spec/hook/get-upload-error-message';

describe('getUploadErrorMessage', () => {
  it('возвращает err.message для Error', () => {
    expect(getUploadErrorMessage(new Error('Upload failed'))).toBe('Upload failed');
  });

  it('возвращает fallback для не-Error', () => {
    expect(getUploadErrorMessage('string error')).toBe('Ошибка загрузки файла');
    expect(getUploadErrorMessage(undefined)).toBe('Ошибка загрузки файла');
    expect(getUploadErrorMessage({ code: 500 })).toBe('Ошибка загрузки файла');
  });
});
