import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import type {
  UploadFileUseCase,
  GetFileUseCase,
  GetFileContentUseCase,
  ListFilesUseCase,
  DeleteFileUseCase,
  DeleteFilesByPathPrefixUseCase,
  UpdateFileContentUseCase,
} from '@/application/use-cases';
import { FilePath } from '@/domain/value-objects';

/**
 * Настройка multer для загрузки файлов в память
 */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
});

export interface FileControllerDeps {
  uploadFileUseCase: UploadFileUseCase;
  getFileUseCase: GetFileUseCase;
  getFileContentUseCase: GetFileContentUseCase;
  listFilesUseCase: ListFilesUseCase;
  deleteFileUseCase: DeleteFileUseCase;
  deleteFilesByPathPrefixUseCase: DeleteFilesByPathPrefixUseCase;
  updateFileContentUseCase: UpdateFileContentUseCase;
}

/**
 * Создаёт роутер для работы с файлами
 */
export function createFileController(deps: FileControllerDeps): Router {
  const router = Router();
  const {
    uploadFileUseCase,
    getFileUseCase,
    getFileContentUseCase,
    listFilesUseCase,
    deleteFileUseCase,
    deleteFilesByPathPrefixUseCase,
    updateFileContentUseCase,
  } = deps;

  /**
   * @swagger
   * /upload:
   *   post:
   *     summary: Загрузить файл
   *     description: Загружает файл в хранилище и сохраняет метаданные в БД
   *     tags: [Files]
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
   *                 description: Файл для загрузки
   *               path:
   *                 type: string
   *                 description: Виртуальный путь к файлу (например docs/doc-1/openapi.yaml). Если не указан, используется имя файла
   *                 example: docs/doc-1/openapi.yaml
   *     responses:
   *       201:
   *         description: Файл успешно загружен
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: string
   *                       format: uuid
   *                       description: Уникальный идентификатор файла
   *                       example: "123e4567-e89b-12d3-a456-426614174000"
   *                     path:
   *                       type: string
   *                       description: Виртуальный путь к файлу
   *                       example: "docs/doc-1/openapi.yaml"
   *                     originalName:
   *                       type: string
   *                       description: Исходное имя файла
   *                       example: openapi.yaml
   *                     size:
   *                       type: integer
   *                       description: Размер файла в байтах
   *                       example: 1024
   *                     mimeType:
   *                       type: string
   *                       nullable: true
   *                       description: MIME-тип файла
   *                       example: "text/yaml"
   *                     createdAt:
   *                       type: string
   *                       format: date-time
   *                       description: Дата создания файла в формате ISO
   *                       example: "2024-01-15T10:30:00.000Z"
   *       400:
   *         description: Ошибка валидации (невалидный путь, файл не предоставлен)
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       500:
   *         description: Внутренняя ошибка сервера
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  // ——— GET /api/v1/files (list all, optional pathPrefix) ———
  /**
   * @swagger
   * /api/v1/files:
   *   get:
   *     summary: Список файлов
   *     description: Возвращает все файлы или файлы по префиксу пути (pathPrefix)
   *     tags: [Files]
   *     parameters:
   *       - in: query
   *         name: pathPrefix
   *         schema:
   *           type: string
   *         description: Префикс пути (например paths/api или components/schemas). Необязательный
   *     responses:
   *       200:
   *         description: Список метаданных файлов
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/FileDto'
   */
  router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const pathPrefix = typeof req.query.pathPrefix === 'string' ? req.query.pathPrefix : undefined;
      const list = await listFilesUseCase.execute({ pathPrefix });
      res.json({ success: true, data: list });
    } catch (err) {
      next(err);
    }
  });

  // ——— GET /by-path?path= (list by path prefix) ———
  /**
   * @swagger
   * /by-path:
   *   get:
   *     summary: Список файлов по пути
   *     description: Возвращает все файлы, путь которых начинается с указанного префикса (слайс/папка)
   *     tags: [Files]
   *     parameters:
   *       - in: query
   *         name: path
   *         required: true
   *         schema:
   *           type: string
   *         description: Префикс пути (например paths/api/v1 или components/schemas)
   *     responses:
   *       200:
   *         description: Список метаданных файлов
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/FileDto'
   *       400:
   *         description: Параметр path не указан
   */
  router.get('/by-path', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const path = typeof req.query.path === 'string' ? req.query.path.trim() : '';
      if (!path) {
        return res.status(400).json({
          success: false,
          error: { message: 'Query parameter "path" is required', code: 'MISSING_PATH' },
        });
      }
      const list = await listFilesUseCase.execute({ pathPrefix: path });
      res.json({ success: true, data: list });
    } catch (err) {
      next(err);
    }
  });

  // ——— GET /:id/content (raw content) — must be before GET /:id ———
  /**
   * @swagger
   * /{id}/content:
   *   get:
   *     summary: Содержимое файла
   *     description: Возвращает сырое содержимое файла по ID
   *     tags: [Files]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       200:
   *         description: Содержимое файла (binary)
   *         content:
   *           application/octet-stream:
   *             schema:
   *               type: string
   *               format: binary
   *       404:
   *         description: Файл не найден
   */
  router.get('/:id/content', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id;
      const buffer = await getFileContentUseCase.execute(id);
      res.setHeader('Content-Type', 'application/octet-stream');
      res.send(buffer);
    } catch (err) {
      next(err);
    }
  });

  // ——— GET /:id (metadata) ———
  /**
   * @swagger
   * /{id}:
   *   get:
   *     summary: Метаданные файла
   *     description: Возвращает метаданные файла по ID
   *     tags: [Files]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
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
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/FileDto'
   *       404:
   *         description: Файл не найден
   */
  router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id;
      if (id === 'content' || id === 'upload' || id === 'by-path') {
        return res.status(404).json({ success: false, error: { message: 'Not found', code: 'NOT_FOUND' } });
      }
      const dto = await getFileUseCase.execute(id);
      res.json({ success: true, data: dto });
    } catch (err) {
      next(err);
    }
  });

  // DELETE /by-path?path=
  /**
   * @swagger
   * /by-path:
   *   delete:
   *     summary: Удалить файлы по пути
   *     description: Удаляет все файлы, путь которых начинается с указанного префикса (слайс/папка)
   *     tags: [Files]
   *     parameters:
   *       - in: query
   *         name: path
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       204:
   *         description: Файлы удалены
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
      await deleteFilesByPathPrefixUseCase.execute(path);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  });

  // ——— PUT /:id/content ———
  /**
   * @swagger
   * /{id}/content:
   *   put:
   *     summary: Обновить содержимое файла
   *     description: Обновляет содержимое существующего файла
   *     tags: [Files]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
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
   *     responses:
   *       204:
   *         description: Содержимое обновлено
   *       404:
   *         description: Файл не найден
   */
  router.put('/:id/content', upload.single('file'), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id;

      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: { message: 'No file provided', code: 'NO_FILE' },
        });
      }

      await updateFileContentUseCase.execute({
        id,
        buffer: req.file.buffer,
      });

      res.status(204).send();
    } catch (err) {
      next(err);
    }
  });

  // ——— DELETE /:id ———
  /**
   * @swagger
   * /{id}:
   *   delete:
   *     summary: Удалить файл
   *     description: Удаляет файл по ID (метаданные и содержимое)
   *     tags: [Files]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       204:
   *         description: Файл удалён
   *       404:
   *         description: Файл не найден
   */
  router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id;
      await deleteFileUseCase.execute(id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  });

  router.post('/upload', upload.single('file'), async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Проверяем, что файл был загружен
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'No file provided',
            code: 'NO_FILE',
          },
        });
      }

      // Определяем путь: из body.path или из имени файла
      const pathParam = (req.body.path as string) || req.file.originalname;
      // Убираем ведущий слэш, если есть
      const path = pathParam.replace(/^\//, '');

      if (!path) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Path is required',
            code: 'INVALID_PATH',
          },
        });
      }

      // Валидируем путь (если невалидный, FilePath.create выбросит DomainException)
      FilePath.create(path);

      // Вызываем use case для загрузки файла
      const originalName = req.file.originalname || path.split('/').pop() || 'file';
      const dto = await uploadFileUseCase.execute({
        buffer: req.file.buffer,
        path,
        originalName,
        mimeType: req.file.mimetype || null,
      });

      // Возвращаем успешный ответ
      res.status(201).json({
        success: true,
        data: dto,
      });
    } catch (err) {
      // Пробрасываем ошибку в error handler middleware
      next(err);
    }
  });

  return router;
}
