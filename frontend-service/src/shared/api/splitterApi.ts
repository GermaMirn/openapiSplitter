import { api } from './axios';

/**
 * API методы для работы с OpenAPI Splitter
 */
export const splitterApi = {
  /**
   * Парсинг и разделение OpenAPI спецификации
   */
  async parseAndSplit(openApiContent: string): Promise<any> {
    const response = await api.post('/split', {
      content: openApiContent,
    });
    return response.data;
  },

  /**
   * Получение структуры разделенных файлов
   */
  async getFileStructure(jobId: string): Promise<any> {
    const response = await api.get(`/split/${jobId}/structure`);
    return response.data;
  },

  /**
   * Скачивание ZIP архива
   */
  async downloadZip(jobId: string): Promise<Blob> {
    const response = await api.get(`/split/${jobId}/zip`, {
      responseType: 'blob',
    });
    return response.data;
  },
};
