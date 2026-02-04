# Files Service

S3-подобный сервис для хранения и управления файлами. Предоставляет REST API для загрузки, получения и удаления файлов. Бюджетная альтернатива Amazon S3 для внутреннего использования.

## Содержание

- [Архитектура](#архитектура)
- [Структура проекта](#структура-проекта)
- [Слои архитектуры](#слои-архитектуры)
- [Принципы проектирования](#принципы-проектирования)
- [Разработка](#разработка)

## Архитектура

Проект использует **Clean Architecture** (также известную как Onion Architecture или Hexagonal Architecture) - подход к проектированию, который обеспечивает:

- **Независимость от фреймворков** - бизнес-логика не зависит от Express, базы данных или файловой системы
- **Тестируемость** - легко тестировать бизнес-логику без HTTP, базы данных и других внешних зависимостей
- **Независимость от UI** - можно легко заменить REST API на GraphQL, gRPC
- **Независимость от базы данных** - можно перейти с PostgreSQL на MongoDB без изменения бизнес-логики
- **Независимость от хранилища** - можно заменить файловую систему на S3, MinIO без изменения бизнес-логики

### Почему Clean Architecture?

1. **Масштабируемость** - легко добавлять новые функции без изменения существующего кода
2. **Поддерживаемость** - четкое разделение ответственности упрощает понимание и изменение кода
3. **Тестируемость** - каждый слой можно тестировать независимо
4. **Гибкость** - можно менять инфраструктуру (база данных, хранилище файлов) без изменения бизнес-логики

## Структура проекта

```
src/
├── domain/                                 # Доменный слой (ядро приложения)
│   ├── entities/                           # Сущности с бизнес-логикой
│   │   └── file.ts                         # File - основная доменная сущность
│   ├── value-objects/                      # Value Objects (неизменяемые объекты-значения)
│   │   ├── file-id.ts                      # FileId - идентификатор файла (UUID)
│   │   └── file-path.ts                    # FilePath - путь к файлу с валидацией
│   ├── interfaces/                         # Интерфейсы для зависимостей
│   │   ├── file-repository.interface.ts
│   │   └── file-storage.interface.ts
│   └── exceptions/                         # Доменные исключения
│       └── domain-exceptions.ts
│
├── application/                            # Слой приложения (Use Cases)
│   ├── use-cases/                          # Use Cases (бизнес-операции)
│   │   ├── upload-file.use-case.ts
│   │   ├── get-file.use-case.ts
│   │   └── delete-file.use-case.ts
│   └── dto/                                # Data Transfer Objects
│       └── file.dto.ts
│
├── infrastructure/                         # Инфраструктурный слой
│   ├── storage/                            # Физическое хранилище файлов
│   │   └── file-system-storage.ts
│   ├── persistence/                        # Репозитории
│   │   └── file-repository.ts
│   └── database/                           # Подключение к БД
│       └── index.ts
│
├── presentation/                           # Слой представления (HTTP)
│   ├── controllers/                        # HTTP контроллеры
│   │   └── health.controller.ts
│   ├── routes/                             # Маршруты
│   │   └── index.ts
│   └── middleware/                         # Express middleware
│       └── error-handler.middleware.ts
│
├── shared/                                 # Общие компоненты
│   ├── config/                             # Конфигурация
│   │   ├── config.ts
│   │   └── swagger.ts
│   └── utils/                              # Утилиты
│       └── logger.ts
│
└── index.ts                                # Точка входа приложения
```

## Слои архитектуры

### 1. Domain Layer (Доменный слой)

**Ответственность**: Содержит бизнес-логику и правила предметной области.

**Что здесь находится:**
- **Entities** (`domain/entities/`) - основные бизнес-сущности с методами
- **Value Objects** (`domain/value-objects/`) - неизменяемые объекты-значения
- **Interfaces** (`domain/interfaces/`) - контракты для зависимостей
- **Exceptions** (`domain/exceptions/`) - доменные исключения

**Правила:**
- Не зависит от других слоев
- Не знает о HTTP, базе данных, файловой системе
- Содержит только бизнес-логику
- Не содержит зависимостей от фреймворков

### 2. Application Layer (Слой приложения)

**Ответственность**: Координирует выполнение бизнес-операций (Use Cases).

**Что здесь находится:**
- **Use Cases** (`application/use-cases/`) - бизнес-операции приложения
- **DTOs** (`application/dto/`) - объекты для передачи данных между слоями

**Правила:**
- Зависит только от Domain слоя
- Использует интерфейсы из Domain для зависимостей
- Не знает о конкретных реализациях (HTTP, база данных, файловая система)
- Не содержит бизнес-логики (она в Domain)

### 3. Infrastructure Layer (Инфраструктурный слой)

**Ответственность**: Реализует технические детали (хранилище файлов, база данных).

**Что здесь находится:**
- **Storage** (`infrastructure/storage/`) - физическое хранилище файлов
- **Persistence** (`infrastructure/persistence/`) - репозитории для базы данных
- **Database** (`infrastructure/database/`) - подключение к БД

**Правила:**
- Реализует интерфейсы из Domain слоя
- Может использовать внешние библиотеки (pg, fs)
- Содержит технические детали реализации
- Не содержит бизнес-логики

### 4. Presentation Layer (Слой представления)

**Ответственность**: Обрабатывает HTTP запросы и формирует ответы.

**Что здесь находится:**
- **Controllers** (`presentation/controllers/`) - обработчики HTTP запросов
- **Routes** (`presentation/routes/`) - маршрутизация
- **Middleware** (`presentation/middleware/`) - промежуточное ПО Express

**Правила:**
- Зависит от Application и Domain слоев
- Тонкий слой - только валидация входных данных и форматирование ответов
- Не содержит бизнес-логики
- Не знает о деталях реализации инфраструктуры

### 5. Shared Layer (Общий слой)

**Ответственность**: Общие утилиты и конфигурация, используемые всеми слоями.

**Что здесь находится:**
- **Config** (`shared/config/`) - конфигурация приложения
- **Utils** (`shared/utils/`) - утилиты (logger, helpers)

**Правила:**
- Не содержит бизнес-логики
- Может использоваться любым слоем
- Не должен создавать циклические зависимости

## Поток данных

```
HTTP Request
    ↓
Presentation Layer (Controller)
    ↓
Application Layer (Use Case)
    ↓
Domain Layer (Entity)
    ↓
Infrastructure Layer (FileStorage, Repository)
    ↓
File System / Database
```

**Пример потока для загрузки файла:**

1. **HTTP Request** → `POST /api/files/upload` с файлом
2. **Controller** → Валидирует входные данные, вызывает Use Case
3. **Use Case** → Координирует выполнение:
   - Создает доменную сущность File
   - Вызывает Repository для сохранения
4. **Repository** → Сохраняет метаданные в БД и файл в хранилище
5. **Response** → Возвращает результат через Controller

## Принципы проектирования

### Dependency Rule (Правило зависимостей)

**Зависимости направлены внутрь** - от внешних слоев к внутренним:

```
Presentation → Application → Domain ← Infrastructure
```

- Domain не зависит ни от чего
- Application зависит только от Domain
- Infrastructure реализует интерфейсы из Domain
- Presentation зависит от Application и Domain

### Interface Segregation (Разделение интерфейсов)

Интерфейсы в Domain слое определяют только то, что нужно:

```typescript
// domain/interfaces/file-storage.interface.ts
export interface IFileStorage {
  save(path: FilePath, content: Buffer): Promise<void>;
  read(path: FilePath): Promise<Buffer>;
  delete(path: FilePath): Promise<void>;
}
```

### Single Responsibility (Единственная ответственность)

Каждый класс отвечает за одну вещь:
- `File` - только логика работы с файлом
- `UploadFileUseCase` - только координация загрузки
- `FileSystemStorage` - только работа с файловой системой
- `FileController` - только обработка HTTP запросов

## Разработка

### Установка зависимостей

```bash
bun install
```

### Запуск в режиме разработки

```bash
bun run dev
```

### Сборка

```bash
bun run build
```

### Запуск в production

```bash
bun run start
```

### Проверка типов

```bash
bun run type-check
```

### Линтинг

```bash
bun run lint
```
