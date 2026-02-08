/**
 * Vitest configuration for openapi-splitter-service
 *
 * Почему Vitest:
 * - Работает с TypeScript без доп. настроек
 * - Встроенный coverage с HTML-отчётом (как pytest-cov)
 * - Path alias @/* → src/*
 * - Один запуск: vitest run --coverage → coverage/index.html
 */
import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: { '@': path.resolve(process.cwd(), 'src') },
  },
  test: {
    environment: 'node',
    globals: true,
    include: ['test/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.d.ts',
        'src/index.ts',
        'src/**/index.ts',
        'src/**/*.interface.ts',
        'src/application/dto/**',
        'src/domain/interfaces/**',
        'src/shared/types/**',
        'src/shared/config/**',
        'src/presentation/controllers/file.controller.ts',
      ],
      thresholds: {
        lines: 100,
        functions: 100,
        branches: 100,
        statements: 100,
      },
    },
  },
});
