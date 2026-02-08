import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import type {
  UploadYamlUseCase,
  GetTreeUseCase,
  GetFileUseCase,
  GetFileContentUseCase,
  DeleteByPathUseCase,
  DeleteFileUseCase,
  ExportZipUseCase,
} from '@/application/use-cases';

/**
 * Настройка multer для загрузки файлов в память
 */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
});

export interface SplitterControllerDeps {
  uploadYamlUseCase: UploadYamlUseCase;
  getTreeUseCase: GetTreeUseCase;
  getFileUseCase: GetFileUseCase;
  getFileContentUseCase: GetFileContentUseCase;
  deleteByPathUseCase: DeleteByPathUseCase;
  deleteFileUseCase: DeleteFileUseCase;
  exportZipUseCase: ExportZipUseCase;
}

/**
 * Создаёт роутер для OpenAPI Splitter
 */
export function createSplitterController(deps: SplitterControllerDeps): Router {
  const router = Router();
  const {
    uploadYamlUseCase,
    getTreeUseCase,
    getFileUseCase,
    getFileContentUseCase,
    deleteByPathUseCase,
    deleteFileUseCase,
    exportZipUseCase,
  } = deps;

  /**
   * @swagger
   * /upload:
   *   post:
   *     summary: Загрузить и разрезать OpenAPI спецификацию
   *     description: Принимает YAML файл или текст, парсит, разрезает по правилам и сохраняет
   *     tags: [Splitter]
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             required:
   *               - file
   *             properties:
   *               file:
   *                 type: string
   *                 format: binary
   *                 description: OpenAPI YAML файл
   *               path:
   *                 type: string
   *                 description: Базовый путь для сохранения (если не указан, используется имя файла)
   *                 example: docs/my-api
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - content
   *             properties:
   *               content:
   *                 type: string
   *                 description: Текст OpenAPI спецификации в формате YAML
   *               path:
   *                 type: string
   *                 description: Базовый путь для сохранения
   *     responses:
   *       201:
   *         description: Спецификация успешно разрезана и сохранена
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   type: object
   *                   properties:
   *                     rootFile:
   *                       type: object
   *                       properties:
   *                         id:
   *                           type: string
   *                         path:
   *                           type: string
   *                         originalName:
   *                           type: string
   *                         size:
   *                           type: integer
   *                         createdAt:
   *                           type: string
   *                     tree:
   *                       type: array
   *                       items:
   *                         type: object
   *                     totalFiles:
   *                       type: integer
   *       400:
   *         description: Невалидный YAML или OpenAPI
   *       413:
   *         description: Файл слишком большой
   */
  router.post('/upload', upload.single('file'), async (req: Request, res: Response, next: NextFunction) => {
    try {
      let input;

      if (req.file) {
        // Multipart форма
        input = {
          buffer: req.file.buffer,
          originalName: req.file.originalname,
          path: req.body.path,
        };
      } else if (req.body.content) {
        // JSON с текстом
        input = {
          content: req.body.content,
          originalName: req.body.originalName || 'openapi.yaml',
          path: req.body.path,
        };
      } else {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Either file or content must be provided',
            code: 'NO_INPUT',
          },
        });
      }

      const result = await uploadYamlUseCase.execute(input);

      return res.status(201).json({
        success: true,
        data: result,
      });
    } catch (err) {
      return next(err);
    }
  });

  /**
   * @swagger
   * /tree:
   *   get:
   *     summary: Получить дерево всех документов
   *     description: Возвращает полное дерево всех загруженных и разрезанных OpenAPI спецификаций
   *     tags: [Splitter]
   *     responses:
   *       200:
   *         description: Дерево файлов
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   type: object
   *                   properties:
   *                     tree:
   *                       type: array
   *                       items:
   *                         type: object
   */
  router.get('/tree', async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await getTreeUseCase.execute();
      return res.json({
        success: true,
        data: result,
      });
    } catch (err) {
      return next(err);
    }
  });

  /**
   * @swagger
   * /files/{id}/content:
   *   get:
   *     summary: Получить файл с контентом
   *     description: Возвращает метаданные и содержимое файла
   *     tags: [Splitter]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Файл с контентом
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   type: object
   *                   properties:
   *                     metadata:
   *                       type: object
   *                     content:
   *                       type: string
   *       404:
   *         description: Файл не найден
   */
  router.get('/files/:id/content', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id;
      const result = await getFileContentUseCase.execute(id);
      return res.json({
        success: true,
        data: result,
      });
    } catch (err) {
      return next(err);
    }
  });

  /**
   * @swagger
   * /files/{id}:
   *   get:
   *     summary: Получить метаданные файла
   *     description: Возвращает метаданные файла по id
   *     tags: [Splitter]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Метаданные файла
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   type: object
   *       404:
   *         description: Файл не найден
   */
  router.get('/files/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id;
      if (id === 'content') {
        return res.status(404).json({
          success: false,
          error: { message: 'Not found', code: 'NOT_FOUND' },
        });
      }
      const result = await getFileUseCase.execute(id);
      return res.json({
        success: true,
        data: result,
      });
    } catch (err) {
      return next(err);
    }
  });

  /**
   * @swagger
   * /by-path:
   *   delete:
   *     summary: Удалить документ со всеми слайсами
   *     description: Удаляет все файлы по префиксу пути (весь документ)
   *     tags: [Splitter]
   *     parameters:
   *       - in: query
   *         name: path
   *         required: true
   *         schema:
   *           type: string
   *         description: Путь документа для удаления
   *     responses:
   *       204:
   *         description: Документ удалён
   *       400:
   *         description: Параметр path не указан
   */
  router.delete('/by-path', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const path = typeof req.query.path === 'string' ? req.query.path.trim() : '';
      if (!path) {
        return res.status(400).json({
          success: false,
          error: { message: 'Query parameter "path" is required', code: 'MISSING_PATH' },
        });
      }
      await deleteByPathUseCase.execute(path);
      return res.status(204).send();
    } catch (err) {
      return next(err);
    }
  });

  /**
   * @swagger
   * /files/{id}:
   *   delete:
   *     summary: Удалить файл
   *     description: Удаляет один файл по id
   *     tags: [Splitter]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       204:
   *         description: Файл удалён
   *       404:
   *         description: Файл не найден
   */
  router.delete('/files/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id;
      await deleteFileUseCase.execute(id);
      return res.status(204).send();
    } catch (err) {
      return next(err);
    }
  });

  /**
   * @swagger
   * /by-path/export/zip:
   *   get:
   *     summary: Экспорт документа в ZIP
   *     description: Скачать ZIP архив со всей структурой файлов по пути
   *     tags: [Splitter]
   *     parameters:
   *       - in: query
   *         name: path
   *         required: true
   *         schema:
   *           type: string
   *         description: Путь документа для экспорта
   *     responses:
   *       200:
   *         description: ZIP архив
   *         content:
   *           application/zip:
   *             schema:
   *               type: string
   *               format: binary
   *       400:
   *         description: Параметр path не указан
   *       404:
   *         description: Файлы не найдены
   */
  router.get('/by-path/export/zip', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const path = typeof req.query.path === 'string' ? req.query.path.trim() : '';
      if (!path) {
        return res.status(400).json({
          success: false,
          error: { message: 'Query parameter "path" is required', code: 'MISSING_PATH' },
        });
      }

      const zipStream = await exportZipUseCase.execute(path);

      // Устанавливаем заголовки для скачивания
      const fileName = `${path.replace(/\//g, '-')}.zip`;
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

      // Отправляем стрим
      return zipStream.pipe(res);
    } catch (err) {
      return next(err);
    }
  });

  return router;
}
