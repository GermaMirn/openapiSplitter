import express, { Router } from 'express';
import { config } from '@/shared/config/config';
import { healthRouter } from '@/presentation/controllers';
import { createFileController } from '@/presentation/controllers/file.controller';
import {
  UploadFileUseCase,
  GetFileUseCase,
  GetFileContentUseCase,
  ListFilesUseCase,
  DeleteFileUseCase,
  DeleteFilesByPathPrefixUseCase,
  UpdateFileContentUseCase,
} from '@/application/use-cases';
import { FileRepository } from '@/infrastructure/persistence';
import { FileSystemStorage } from '@/infrastructure/storage';

const fileRepository = new FileRepository();
const fileStorage = new FileSystemStorage();
const uploadFileUseCase = new UploadFileUseCase(fileRepository, fileStorage);
const getFileUseCase = new GetFileUseCase(fileRepository);
const getFileContentUseCase = new GetFileContentUseCase(fileRepository, fileStorage);
const listFilesUseCase = new ListFilesUseCase(fileRepository);
const deleteFileUseCase = new DeleteFileUseCase(fileRepository, fileStorage);
const deleteFilesByPathPrefixUseCase = new DeleteFilesByPathPrefixUseCase(fileRepository, fileStorage);
const updateFileContentUseCase = new UpdateFileContentUseCase(fileRepository, fileStorage);

const apiBase = `/api/${config.api.version}/files`;

/**
 * Создаёт роутер приложения с зарегистрированными маршрутами (версионированный API).
 */
export function createAppRouter(): Router {
  const router = express.Router();

  router.use(`${apiBase}/health`, healthRouter);
  router.use(apiBase, createFileController({
    uploadFileUseCase,
    getFileUseCase,
    getFileContentUseCase,
    listFilesUseCase,
    deleteFileUseCase,
    deleteFilesByPathPrefixUseCase,
    updateFileContentUseCase,
  }));

  return router;
}
