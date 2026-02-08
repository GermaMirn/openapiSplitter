import axios, { type AxiosInstance } from 'axios';
import FormData from 'form-data';
import { FileNotFoundError } from '@/domain/exceptions';
import { isAxiosError, type TypedAxiosError, type CaughtError } from '@/shared/types';
import { config } from '@/shared/config/config';

/**
 * DTO файла из files-service
 */
export interface FileDto {
  id: string;
  path: string;
  originalName: string;
  size: number;
  mimeType: string | null;
  createdAt: string;
}

/**
 * Клиент для взаимодействия с files-service.
 * Добавляет заголовки X-Internal-Service (и при необходимости X-Internal-Secret), чтобы files-service не применял rate limit к внутренним вызовам.
 */
export class FilesServiceClient {
  private readonly client: AxiosInstance;

  constructor(baseUrl: string) {
    const { internalServiceHeader, internalServiceSecret } = config.filesService;
    const headers: Record<string, string> = {
      'X-Internal-Service': internalServiceHeader,
    };
    if (internalServiceSecret) {
      headers['X-Internal-Secret'] = internalServiceSecret;
    }
    this.client = axios.create({
      baseURL: `${baseUrl}/api/v1/files`,
      timeout: 30000,
      headers,
    });
  }

  /**
   * Загрузить файл
   */
  async uploadFile(buffer: Buffer, path: string, originalName: string): Promise<FileDto> {
    const formData = new FormData();
    formData.append('file', buffer, { filename: originalName });
    formData.append('path', path);

    const response = await this.client.post<{ success: boolean; data: FileDto }>('/upload', formData, {
      headers: formData.getHeaders(),
    });

    return response.data.data;
  }

  /**
   * Получить метаданные файла по id
   */
  async getFile(id: string): Promise<FileDto> {
    try {
      const response = await this.client.get<{ success: boolean; data: FileDto }>(`/${id}`);
      return response.data.data;
    } catch (error) {
      return this.handleFileError(error as CaughtError, id);
    }
  }

  /**
   * Получить содержимое файла по id
   */
  async getFileContent(id: string): Promise<Buffer> {
    try {
      const response = await this.client.get<Buffer>(`/${id}/content`, {
        responseType: 'arraybuffer',
      });
      return Buffer.from(response.data);
    } catch (error) {
      return this.handleFileError(error as CaughtError, id);
    }
  }

  /**
   * Получить список файлов по префиксу пути
   */
  async listFiles(pathPrefix?: string): Promise<FileDto[]> {
    const response = await this.client.get<{ success: boolean; data: FileDto[] }>('/', {
      params: pathPrefix ? { pathPrefix } : {},
    });
    return response.data.data;
  }

  /**
   * Удалить файл по id
   */
  async deleteFile(id: string): Promise<void> {
    try {
      await this.client.delete(`/${id}`);
    } catch (error) {
      return this.handleFileError(error as CaughtError, id);
    }
  }

  /**
   * Удалить все файлы по префиксу пути
   */
  async deleteFilesByPath(path: string): Promise<void> {
    await this.client.delete('/by-path', {
      params: { path },
    });
  }

  /**
   * Получить список файлов по префиксу пути
   */
  async getFilesByPath(pathPrefix: string): Promise<FileDto[]> {
    return this.listFiles(pathPrefix);
  }

  /**
   * Обновить содержимое файла
   */
  async updateFileContent(id: string, content: Buffer): Promise<void> {
    try {
      const formData = new FormData();
      formData.append('file', content, { filename: 'updated.yaml' });

      await this.client.put(`/${id}/content`, formData, {
        headers: formData.getHeaders(),
      });
    } catch (error) {
      return this.handleFileError(error as CaughtError, id);
    }
  }

  /**
   * Обработка ошибок файловых операций
   * @throws FileNotFoundError если файл не найден или ID невалиден
   * @throws Error оригинальная ошибка если это не 404/400
   */
  private handleFileError(error: CaughtError, id: string): never {
    if (error instanceof Error && isAxiosError(error)) {
      const axiosError = error as TypedAxiosError;

      if (axiosError.response?.status === 404) {
        throw new FileNotFoundError(`File with id ${id} not found`);
      }

      // files-service возвращает 400 для невалидного UUID (INVALID_FILE_ID) — маппим в 404
      if (axiosError.response?.status === 400) {
        const code = axiosError.response?.data?.error?.code;
        if (code === 'INVALID_FILE_ID') {
          throw new FileNotFoundError(`File with id ${id} not found`);
        }
      }
    }

    // Если это не Error, оборачиваем
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(String(error));
  }
}
