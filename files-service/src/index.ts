import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { config } from '@/shared/config/config';
import { swaggerSpec } from '@/shared/config/swagger';
import { logger } from '@/shared/utils/logger';
import { connectDatabaseWithRetry } from '@/infrastructure/database';
import { createRateLimitStore } from '@/infrastructure/rate-limit';
import { errorHandler } from '@/presentation/middleware/error-handler.middleware';
import { createRateLimiterMiddleware } from '@/presentation/middleware/rate-limiter.middleware';
import { createAppRouter } from '@/presentation/routes';

dotenv.config();

const app = express();
app.set('trust proxy', 1);

// middleware
app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
}));
app.use(express.json({ limit: '150mb' }));
app.use(express.urlencoded({ extended: true, limit: '150mb' }));

// rate limit
const rateLimitStore = createRateLimitStore({
  redisUrl: config.redis.url,
  keyPrefix: 'rl:files',
  max: config.rateLimit.max,
  windowSec: config.rateLimit.windowSec,
});
app.use(createRateLimiterMiddleware(rateLimitStore));

// swagger ui (под версионированным путём API)
const docsBase = `/api/${config.api.version}/files/docs`;
app.use(`${docsBase}`, swaggerUi.serve);
app.get([docsBase, `${docsBase}/`], swaggerUi.setup(null, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Files Service API Docs',
  swaggerOptions: {
    persistAuthorization: true,
    url: `${docsBase}/swagger.json`,
  },
}));
app.get(`${docsBase}/swagger.json`, (_req, res) => res.send(swaggerSpec));

// routes
app.use(createAppRouter());

// error handler
app.use(errorHandler);

async function start(): Promise<void> {
  await connectDatabaseWithRetry();
  app.listen(config.port, '0.0.0.0', () => {
    logger.info(`Files Service running on port ${config.port}`);
  });
}

start().catch((err) => {
  logger.error('Failed to start', { err: err instanceof Error ? err.message : String(err) });
  process.exit(1);
});

export default app;
