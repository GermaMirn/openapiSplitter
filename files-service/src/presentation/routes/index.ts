import express, { Router } from 'express';
import { healthRouter } from '@/presentation/controllers';
import { createFileController } from '@/presentation/controllers/file.controller';
import {
  UploadFileUseCase,
  GetFileUseCase,
  GetFileContentUseCase,
  ListFilesUseCase,
  DeleteFileUseCase,
  DeleteFilesByPathPrefixUseCase,
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

/**
 * Создаёт роутер приложения с зарегистрированными маршрутами.
*/
export function createAppRouter(): Router {
  const router = express.Router();

  router.use('/api/files/health', healthRouter);
  router.use('/api/files', createFileController({
    uploadFileUseCase,
    getFileUseCase,
    getFileContentUseCase,
    listFilesUseCase,
    deleteFileUseCase,
    deleteFilesByPathPrefixUseCase,
  }));

  return router;
}
