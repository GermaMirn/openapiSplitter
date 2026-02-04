# OpenAPI Splitter Service

Сервис для парсинга и разделения OpenAPI спецификаций на логические части согласно правилам разделения.

## Содержание

- [Архитектура](#архитектура)
- [Структура проекта](#структура-проекта)
- [Слои архитектуры](#слои-архитектуры)
- [Принципы проектирования](#принципы-проектирования)
- [Разработка](#разработка)

## Архитектура

Проект использует **Clean Architecture** (также известную как Onion Architecture или Hexagonal Architecture) - подход к проектированию, который обеспечивает:

- **Независимость от фреймворков** - бизнес-логика не зависит от Express, базы данных или других внешних библиотек
- **Тестируемость** - легко тестировать бизнес-логику без HTTP, базы данных и других внешних зависимостей
- **Независимость от UI** - можно легко заменить REST API на GraphQL, gRPC
- **Независимость от базы данных** - можно перейти с PostgreSQL на MongoDB без изменения бизнес-логики
- **Независимость от внешних сервисов** - бизнес-логика не знает о конкретных реализациях внешних сервисов

### Почему Clean Architecture?

1. **Масштабируемость** - легко добавлять новые функции без изменения существующего кода
2. **Поддерживаемость** - четкое разделение ответственности упрощает понимание и изменение кода
3. **Тестируемость** - каждый слой можно тестировать независимо
4. **Гибкость** - можно менять инфраструктуру (база данных, HTTP фреймворк) без изменения бизнес-логики

## Структура проекта

```
src/
├── domain/                                 # Доменный слой (ядро приложения)
│   ├── entities/                           # Сущности с бизнес-логикой
│   │   └── openapi-spec.ts                 # OpenAPISpec - основная доменная сущность
│   ├── value-objects/                      # Value Objects (неизменяемые объекты-значения)
│   │   └── file-path.ts                    # FilePath - путь к файлу с валидацией
│   ├── interfaces/                         # Интерфейсы для зависимостей
│   │   ├── spec-parser.interface.ts
│   │   └── file-storage.interface.ts
│   └── exceptions/                         # Доменные исключения
│       └── domain-exceptions.ts
│
├── application/                            # Слой приложения (Use Cases)
│   ├── use-cases/                          # Use Cases (бизнес-операции)
│   │   └── split-openapi-spec.use-case.ts
│   └── dto/                                # Data Transfer Objects
│       └── split-spec.dto.ts
│
├── infrastructure/                         # Инфраструктурный слой
│   ├── parsers/                            # Парсеры (YAML, JSON)
│   │   └── yaml-spec-parser.ts
│   ├── external/                           # Внешние сервисы
│   │   └── files-service-client.ts
│   └── persistence/                        # Репозитории (для будущего использования)
│
├── presentation/                           # Слой представления (HTTP)
│   ├── controllers/                        # HTTP контроллеры
│   │   ├── health.controller.ts
│   │   └── split.controller.ts
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
- Не знает о HTTP, базе данных, внешних сервисах
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
- Не знает о конкретных реализациях (HTTP, база данных)
- Не содержит бизнес-логики (она в Domain)

### 3. Infrastructure Layer (Инфраструктурный слой)

**Ответственность**: Реализует технические детали (парсинг, HTTP клиенты, база данных).

**Что здесь находится:**
- **Parsers** (`infrastructure/parsers/`) - парсеры YAML/JSON
- **External** (`infrastructure/external/`) - клиенты внешних сервисов
- **Persistence** (`infrastructure/persistence/`) - репозитории для базы данных

**Правила:**
- Реализует интерфейсы из Domain слоя
- Может использовать внешние библиотеки (js-yaml, axios, pg)
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
Infrastructure Layer (Parser, FileStorage)
    ↓
External Services / Database
```

**Пример потока для разделения спецификации:**

1. **HTTP Request** → `POST /api/splitter/split` с YAML контентом
2. **Controller** → Валидирует входные данные, вызывает Use Case
3. **Use Case** → Координирует выполнение:
   - Вызывает Parser для парсинга
   - Вызывает Entity.split() для разделения
   - Вызывает FileStorage для сохранения
4. **Entity** → Выполняет бизнес-логику разделения
5. **Infrastructure** → Реализует технические детали (парсинг, сохранение)
6. **Response** → Возвращает результат через Controller

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
// domain/interfaces/spec-parser.interface.ts
export interface ISpecParser {
  parse(content: string): Promise<OpenAPISpec>;
  parseObject(spec: Record<string, unknown>): OpenAPISpec;
}
```

### Single Responsibility (Единственная ответственность)

Каждый класс отвечает за одну вещь:
- `OpenAPISpec` - только логика работы со спецификацией
- `SplitOpenAPISpecUseCase` - только координация разделения
- `YamlSpecParser` - только парсинг
- `SplitController` - только обработка HTTP запросов

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
