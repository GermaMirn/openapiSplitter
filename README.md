# OpenAPI Splitter

Инструмент для разделения больших OpenAPI спецификаций на логические части согласно внутренним правилам.

## Архитектура

Проект состоит из следующих сервисов:

- **openapi-splitter-service** (порт 8000) - сервис для парсинга и разделения OpenAPI спецификаций
- **files-service** (порт 8001) - S3-like сервис для работы с файлами (сохранение, получение, удаление)
- **frontend-service** (порт 5173) - React приложение
- **nginx** (порт 80) - reverse proxy для маршрутизации запросов
- **db-splitter** (порт 5432) - PostgreSQL база данных для openapi-splitter-service
- **db-files** (порт 5434) - PostgreSQL база данных для files-service

## Схема взаимодействия

```
Frontend → Nginx → OpenAPI-Splitter-Service → Files-Service
```

Фронтенд обращается только к `openapi-splitter-service` через nginx, который сам взаимодействует с `files-service`.

## API Документация

После запуска проекта доступна Swagger UI документация:

- **OpenAPI Splitter Service**: http://localhost/api/splitter/docs
- **Files Service**: http://localhost/api/files/docs

## Технологический стек

### Backend
- **Runtime**: Bun
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL (pg)
- **Validation**: Zod
- **API Documentation**: Swagger (swagger-jsdoc, swagger-ui-express)
- **OpenAPI Parser**: swagger-parser (openapi-splitter-service)
- **File Upload**: multer (files-service)
- **Utilities**: dotenv, cors, axios, uuid (files-service), js-yaml (openapi-splitter-service)

### Frontend
- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **Routing**: React Router DOM
- **State Management**: Zustand
- **UI Library**: PrimeReact + PrimeIcons
- **Styling**: Tailwind CSS + PostCSS + Autoprefixer
- **HTTP Client**: Axios
- **YAML Parser**: js-yaml
- **Code Highlighting**: react-syntax-highlighter
- **Architecture**: Feature-Sliced Design (FSD)
- **Package Manager**: Bun

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **Reverse Proxy**: Nginx
- **Database**: PostgreSQL 15

## Структура проекта

```
openapiSplitter/
├── docker-compose.yml
├── README.md
├── .gitignore
├── infrastructure/
│   └── nginx/
│       └── default.conf
├── openapi-splitter-service/
│   ├── src/
│   │   ├── domain/          # Доменный слой (сущности, value objects, интерфейсы)
│   │   ├── application/     # Слой приложения (use cases, DTOs)
│   │   ├── infrastructure/  # Инфраструктурный слой (парсеры, внешние клиенты)
│   │   ├── presentation/    # Слой представления (контроллеры, роуты, middleware)
│   │   └── shared/          # Общий слой (конфиг, утилиты, типы)
│   ├── package.json
│   ├── Dockerfile
│   ├── tsconfig.json
│   └── README.md
├── files-service/
│   ├── src/
│   │   ├── domain/          # Доменный слой (сущности, value objects, интерфейсы)
│   │   ├── application/     # Слой приложения (use cases, DTOs)
│   │   ├── infrastructure/  # Инфраструктурный слой (БД, хранилище, persistence)
│   │   ├── presentation/    # Слой представления (контроллеры, роуты, middleware)
│   │   └── shared/          # Общий слой (конфиг, утилиты, типы)
│   ├── package.json
│   ├── Dockerfile
│   ├── tsconfig.json
│   └── README.md
└── frontend-service/
    ├── src/
    │   ├── app/             # Точка входа приложения
    │   ├── pages/           # Страницы (FSD)
    │   ├── widgets/         # Виджеты (FSD)
    │   ├── features/        # Фичи (FSD)
    │   ├── entities/        # Сущности (FSD)
    │   └── shared/          # Общее (FSD: UI, API, конфиг, стили)
    ├── package.json
    ├── Dockerfile
    ├── vite.config.ts
    ├── tailwind.config.js
    └── tsconfig.json
```

## Быстрый старт

### Предварительные требования

- Docker и Docker Compose
- Bun (для локальной разработки, опционально)

### Запуск через Docker Compose

1. Клонируйте репозиторий:
```bash
git clone <repository-url>
cd openapiSplitter
```

2. Создайте файлы `.env` для каждого сервиса (на основе `.env.example`):
```bash
cp openapi-splitter-service/.env.example openapi-splitter-service/.env
cp files-service/.env.example files-service/.env
```

3. Запустите все сервисы:
```bash
docker-compose up -d
```

4. Откройте приложение в браузере:
```
http://localhost
```

### Локальная разработка

Для разработки отдельных сервисов локально:

1. Установите зависимости в каждом сервисе:
```bash
cd openapi-splitter-service && bun install
cd ../files-service && bun install
cd ../frontend-service && bun install
```

2. Запустите базы данных:
```bash
docker-compose up db-splitter db-files -d
```

3. Запустите сервисы локально (в отдельных терминалах):
```bash
cd openapi-splitter-service && bun run dev

# files-service
cd files-service && bun run dev

# frontend-service
cd frontend-service && bun run dev
```

## Мониторинг (опционально)

Для включения мониторинга раскомментируйте сервисы `prometheus` и `grafana` в `docker-compose.yml`:

- Prometheus: http://localhost:9090
- Grafana: http://localhost:3000
