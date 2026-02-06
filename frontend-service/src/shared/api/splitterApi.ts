import { api } from './axios';
import type { ApiResponse, FileMetadata, FileWithContent, TreeNode, UploadYamlResponse } from '@/shared/types';

/**
 * API методы для работы с OpenAPI Splitter Service
*/
export const splitterApi = {
  /**
   * Загрузить и разрезать OpenAPI YAML спецификацию
   * @param file - Файл для загрузки
   * @param path - Опциональный базовый путь для сохранения
  */
  async uploadYaml(file: File, path?: string): Promise<UploadYamlResponse> {
    const formData = new FormData();
    formData.append('file', file);
    if (path) {
      formData.append('path', path);
    }

    const response = await api.post<ApiResponse<UploadYamlResponse>>('/splitter/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (!response.data.success) {
      throw new Error(response.data.error.message);
    }

    return response.data.data;
  },

  /**
   * Загрузить OpenAPI спецификацию из текста
   * @param content - Текст YAML спецификации
   * @param originalName - Имя файла
   * @param path - Опциональный базовый путь для сохранения
  */
  async uploadYamlContent(content: string, originalName: string, path?: string): Promise<UploadYamlResponse> {
    const response = await api.post<ApiResponse<UploadYamlResponse>>('/splitter/upload', {
      content,
      originalName,
      path,
    });

    if (!response.data.success) {
      throw new Error(response.data.error.message);
    }

    return response.data.data;
  },

  /**
   * Получить дерево всех загруженных документов
  */
  async getTree(): Promise<TreeNode[]> {
    const response = await api.get<ApiResponse<{ tree: TreeNode[] }>>('/splitter/tree');

    if (!response.data.success) {
      throw new Error(response.data.error.message);
    }

    return response.data.data.tree;
  },

  /**
   * Получить содержимое файла по ID
   * @param id - ID файла
  */
  async getFileContent(id: string): Promise<FileWithContent> {
    const response = await api.get<ApiResponse<FileWithContent>>(`/splitter/files/${id}/content`);

    if (!response.data.success) {
      throw new Error(response.data.error.message);
    }

    return response.data.data;
  },

  /**
   * Получить метаданные файла по ID
   * @param id - ID файла
  */
  async getFileMetadata(id: string): Promise<FileMetadata> {
    const response = await api.get<ApiResponse<FileMetadata>>(`/splitter/files/${id}`);

    if (!response.data.success) {
      throw new Error(response.data.error.message);
    }

    return response.data.data;
  },

  /**
   * Удалить документ со всеми файлами по пути
   * @param path - Путь документа
  */
  async deleteByPath(path: string): Promise<void> {
    await api.delete('/splitter/by-path', {
      params: { path },
    });
  },

  /**
   * Удалить файл по ID
   * @param id - ID файла
  */
  async deleteFile(id: string): Promise<void> {
    await api.delete(`/splitter/files/${id}`);
  },

  /**
   * Экспортировать документ в ZIP
   * @param path - Путь документа
   * @returns Blob с ZIP архивом
  */
  async exportZip(path: string): Promise<Blob> {
    const response = await api.get('/splitter/by-path/export/zip', {
      params: { path },
      responseType: 'blob',
    });

    return response.data;
  },
};
