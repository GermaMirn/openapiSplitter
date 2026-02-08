import { logger } from '@/shared/utils/logger';

export interface ConnectWithRetryOptions {
  connectRetries: number;
  connectRetryDelayMs: number;
}

/**
 * Выполняет connect с ретраями (для тестов и для connectDatabaseWithRetry).
 */
export async function connectWithRetry(
  connect: () => Promise<void>,
  options: ConnectWithRetryOptions
): Promise<void> {
  const { connectRetries, connectRetryDelayMs } = options;
  let lastError: unknown;
  for (let attempt = 1; attempt <= connectRetries; attempt++) {
    try {
      await connect();
      logger.info('Database connected');
      return;
    } catch (err) {
      lastError = err;
      logger.warn('Database connection attempt failed', {
        attempt,
        maxRetries: connectRetries,
        err: err instanceof Error ? err.message : String(err),
      });
      if (attempt < connectRetries) {
        await new Promise((r) => setTimeout(r, connectRetryDelayMs));
      }
    }
  }
  throw lastError;
}
