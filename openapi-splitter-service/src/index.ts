import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { config } from '@/shared/config/config';
import { swaggerSpec } from '@/shared/config/swagger';
import { logger } from '@/shared/utils/logger';
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
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// rate limit (Redis-based when REDIS_URL is set; store in infrastructure, port in application)
const rateLimitStore = createRateLimitStore({
  redisUrl: config.redis.url,
  keyPrefix: 'rl:splitter',
  max: config.rateLimit.max,
  windowSec: config.rateLimit.windowSec,
});
app.use(createRateLimiterMiddleware(rateLimitStore));

// swagger ui
app.use('/api/splitter/docs', swaggerUi.serve);
app.get(['/api/splitter/docs', '/api/splitter/docs/'], swaggerUi.setup(null, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'OpenAPI Splitter API Docs',
  swaggerOptions: {
    persistAuthorization: true,
    url: '/api/splitter/docs/swagger.json',
  },
}));
app.get('/api/splitter/docs/swagger.json', (_req, res) => res.send(swaggerSpec));

// routes
app.use(createAppRouter());

// error handler
app.use(errorHandler);

app.listen(config.port, '0.0.0.0', () => {
  logger.info(`OpenAPI Splitter Service running on port ${config.port}`);
});

export default app;
