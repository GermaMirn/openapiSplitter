# OpenAPI Splitter Service

Микросервис для парсинга и разделения монолитных OpenAPI спецификаций на логические части согласно правилам.

## Описание

Сервис принимает большой файл `openapi.yaml`, разрезает его на структурированные части (components, paths) и сохраняет результат в файловое хранилище через `files-service`.

### Правила разделения

1. **Общие поля** (`openapi`, `info`, `servers`, `tags`) остаются в корневом файле `openapi.yaml`
2. **Components** выносятся в `components/{type}/{Name}.yaml`
   - Например: `components/schemas/User.yaml`, `components/securitySchemes/BearerAuth.yaml`
3. **Paths** выносятся в структуру, повторяющую URL-путь
   - `/api/v1/users` → `paths/api/v1/users.yaml`
   - `/api/v1/users/{id}` → `paths/api/v1/users/{id}.yaml`
4. Все ссылки `$ref` остаются абсолютными (например, `#/components/schemas/User`)

## Архитектура

Реализовано по принципам **DDD (Domain-Driven Design)** с чёткым разделением слоёв:

```
src/
├── domain/                    # Доменный слой (бизнес-логика)
│   ├── entities/             # Сущности (VirtualFile, SplitResult)
│   ├── value-objects/        # Value Objects (VirtualPath, OpenApiVersion)
│   ├── interfaces/           # Интерфейсы доменных сервисов
│   └── exceptions/           # Доменные исключения
├── application/              # Слой приложения (use cases)
│   ├── dto/                  # DTO для use cases
│   └── use-cases/            # Бизнес-кейсы
├── infrastructure/           # Инфраструктурный слой (реализации)
│   ├── parsers/             # YAML парсер
│   ├── validators/          # OpenAPI валидатор
│   ├── splitter/            # Логика разрезки
│   ├── external/            # Клиент для files-service
│   └── tree/                # Построитель дерева
├── presentation/            # Слой представления (REST API)
│   ├── controllers/        # Контроллеры
│   ├── routes/             # Маршруты
│   └── middleware/         # Middleware (error handler)
└── shared/                  # Общие утилиты
    ├── config/             # Конфигурация
    ├── types/              # Общие типы
    └── utils/              # Утилиты (logger)
```

## API Endpoints

### POST `/api/splitter/upload`
Загрузить и разрезать OpenAPI спецификацию

**Request:**
- `multipart/form-data`:
  - `file` (required): YAML файл
  - `path` (optional): базовый путь для сохранения (если не указан, используется имя файла)
- или `application/json`:
  ```json
  {
    "content": "openapi: 3.0.0\n...",
    "path": "docs/my-api"
  }
  ```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "rootFile": {
      "id": "uuid",
      "path": "docs/my-api/openapi.yaml",
      "originalName": "openapi.yaml",
      "size": 1024,
      "createdAt": "2024-01-15T10:30:00.000Z"
    },
    "tree": [...],
    "totalFiles": 15
  }
}
```

### GET `/api/splitter/tree`
Получить дерево всех документов

**Response (200):**
```json
{
  "success": true,
  "data": {
    "tree": [
      {
        "key": "doc-id",
        "label": "openapi.yaml",
        "data": { "type": "document", "fileId": "uuid" },
        "children": [...]
      }
    ]
  }
}
```

### GET `/api/splitter/files/:id`
Получить метаданные файла

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "path": "docs/my-api/components/schemas/User.yaml",
    "originalName": "User.yaml",
    "size": 256,
    "mimeType": "text/yaml",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### GET `/api/splitter/files/:id/content`
Получить файл с контентом

**Response (200):**
```json
{
  "success": true,
  "data": {
    "metadata": { ... },
    "content": "type: object\nproperties:\n  id:\n    type: string\n..."
  }
}
```

### DELETE `/api/splitter/by-path?path=...`
Удалить документ со всеми слайсами

**Response (204):** No content

### DELETE `/api/splitter/files/:id`
Удалить один файл

**Response (204):** No content

### GET `/api/splitter/by-path/export/zip?path=...`
Скачать ZIP архив с документом

**Response (200):** Binary (application/zip)

### GET `/api/splitter/health`
Health check

**Response (200):**
```json
{
  "status": "ok",
  "service": "openapi-splitter-service"
}
```

## Технологии

- **Runtime:** Bun
- **Framework:** Express.js
- **Language:** TypeScript
- **YAML Parser:** js-yaml
- **OpenAPI Validator:** @apidevtools/swagger-parser
- **HTTP Client:** axios
- **Archive:** archiver
- **Testing:** Vitest + @vitest/coverage-v8

## Зависимости

- **files-service** - для хранения файлов (порт 8001)

## Переменные окружения

```bash
PORT=8000                                                      # Порт сервиса
NODE_ENV=development                                           # Окружение
FILES_SERVICE_URL=http://files-service:8002                   # URL files-service
CORS_ORIGIN=http://localhost:5173                             # CORS origin
```

## Запуск

### Development

```bash
# Установка зависимостей
bun install

# Запуск в dev режиме
bun run dev
```

### Production

```bash
# Сборка
bun run build

# Запуск
bun start
```

### Docker

```bash
# Сборка образа
docker build -t openapi-splitter-service .

# Запуск контейнера
docker run -p 8000:8000 \
  -e FILES_SERVICE_URL=http://files-service:8002 \
  openapi-splitter-service
```

## API Documentation

Swagger UI доступен по адресу: `http://localhost:8000/api/splitter/docs`

### Тестирование (Vitest)

```bash
bun run test          # запуск тестов
bun run test:watch    # watch-режим
bun run test:coverage # с отчётом покрытия (coverage/index.html)
```

Unit-тесты покрывают: domain (value-objects, entities, exceptions), application (use-cases), presentation (health.controller, error-handler), shared/utils (logger). Infra слой (Prisma, file storage) исключён из coverage.

## Примеры использования

### Загрузка спецификации (файл)

```bash
curl -X POST http://localhost:8000/api/splitter/upload \
  -F "file=@openapi.yaml" \
  -F "path=docs/my-api"
```

### Загрузка спецификации (JSON)

```bash
curl -X POST http://localhost:8000/api/splitter/upload \
  -H "Content-Type: application/json" \
  -d '{
    "content": "openapi: 3.0.0\ninfo:\n  title: My API\n...",
    "path": "docs/my-api"
  }'
```

### Получение дерева

```bash
curl http://localhost:8000/api/splitter/tree
```

### Получение файла с контентом

```bash
curl http://localhost:8000/api/splitter/files/{id}/content
```

### Скачивание ZIP

```bash
curl -o my-api.zip "http://localhost:8000/api/splitter/by-path/export/zip?path=docs/my-api"
```

### Удаление документа

```bash
curl -X DELETE "http://localhost:8000/api/splitter/by-path?path=docs/my-api"
```

## Обработка ошибок

Все ошибки возвращаются в едином формате:

```json
{
  "success": false,
  "error": {
    "message": "Invalid YAML syntax",
    "code": "INVALID_YAML"
  }
}
```

### Коды ошибок

- `INVALID_YAML` - невалидный YAML синтаксис
- `INVALID_OPENAPI` - невалидная OpenAPI спецификация
- `SPEC_TOO_LARGE` - файл слишком большой (>50MB)
- `FILE_NOT_FOUND` - файл не найден
- `MISSING_PATH` - отсутствует обязательный параметр path
- `NO_INPUT` - не предоставлен ни файл, ни контент
- `VALIDATION_FAILED` - ошибка валидации OpenAPI
- `INTERNAL_ERROR` - внутренняя ошибка сервера

---

## Улучшения

Планируемые или рекомендуемые доработки для production-ready сценариев:

- **Интеграционные тесты** — e2e/API-тесты для полного цикла запросов (supertest или аналог).
- **Rate limiter** — ограничение частоты запросов по IP или по ключу (например, express-rate-limit), отдельные лимиты для upload (тяжёлая операция) и для read, чтобы защититься от злоупотреблений и DDoS.
- **Redis** — кэш дерева и списков по path prefix для снижения количества запросов к files-service; счётчики для rate limiting; при необходимости — очереди для фоновой разрезки больших спецификаций.
- **SSE для загрузки** — Server-Sent Events для длительных загрузок: поток событий с прогрессом (парсинг → валидация → разрезка → сохранение в files-service), чтобы фронт мог показывать индикатор и не зависать на долгих запросах.
