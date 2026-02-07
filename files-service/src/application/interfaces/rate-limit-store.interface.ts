/** Результат потребления лимита в хранилище. */
export type RateLimitConsumeResult =
  | {
      allowed: true;
      remainingPoints: number;
      msBeforeNext: number;
      limitMax: number;
    }
  | {
      allowed: false;
      retryAfterMs: number;
      limitMax: number;
    };

/** Порт хранилища для rate limit */
export interface IRateLimitStore {
  consume(key: string): Promise<RateLimitConsumeResult>;
}
