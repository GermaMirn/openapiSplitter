import express, { Router } from 'express';
import { healthRouter, createSplitterController } from '@/presentation/controllers';
import {
  UploadYamlUseCase,
  GetTreeUseCase,
  GetFileUseCase,
  GetFileContentUseCase,
  DeleteByPathUseCase,
  DeleteFileUseCase,
  ExportZipUseCase,
} from '@/application/use-cases';
import { YamlParser } from '@/infrastructure/parsers';
import { OpenApiValidator } from '@/infrastructure/validators';
import { OpenApiSplitter } from '@/infrastructure/splitter';
import { FilesServiceClient } from '@/infrastructure/external';
import { TreeBuilder } from '@/infrastructure/tree';
import { config } from '@/shared/config/config';

// Инициализация инфраструктурных зависимостей
const yamlParser = new YamlParser();
const openApiValidator = new OpenApiValidator();
const openApiSplitter = new OpenApiSplitter(yamlParser);
const filesServiceClient = new FilesServiceClient(config.filesService.url);
const treeBuilder = new TreeBuilder();

// Инициализация use cases
const uploadYamlUseCase = new UploadYamlUseCase(
  yamlParser,
  openApiValidator,
  openApiSplitter,
  filesServiceClient,
  treeBuilder
);
const getTreeUseCase = new GetTreeUseCase(filesServiceClient, treeBuilder);
const getFileUseCase = new GetFileUseCase(filesServiceClient);
const getFileContentUseCase = new GetFileContentUseCase(filesServiceClient);
const deleteByPathUseCase = new DeleteByPathUseCase(filesServiceClient);
const deleteFileUseCase = new DeleteFileUseCase(filesServiceClient, yamlParser);
const exportZipUseCase = new ExportZipUseCase(filesServiceClient);

/**
 * Создаёт роутер приложения с зарегистрированными маршрутами
*/
export function createAppRouter(): Router {
  const router = express.Router();

  router.use('/api/splitter/health', healthRouter);
  router.use('/api/splitter', createSplitterController({
    uploadYamlUseCase,
    getTreeUseCase,
    getFileUseCase,
    getFileContentUseCase,
    deleteByPathUseCase,
    deleteFileUseCase,
    exportZipUseCase,
  }));

  return router;
}
