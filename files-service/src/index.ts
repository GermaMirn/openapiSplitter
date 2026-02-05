import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { config } from '@/shared/config/config';
import { swaggerSpec } from '@/shared/config/swagger';
import { logger } from '@/shared/utils/logger';
import { errorHandler } from '@/presentation/middleware/error-handler.middleware';
import { createAppRouter } from '@/presentation/routes';

dotenv.config();

const app = express();

// middleware
app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
}));
app.use(express.json({ limit: '150mb' }));
app.use(express.urlencoded({ extended: true, limit: '150mb' }));

// swagger ui
app.use('/api/files/docs', swaggerUi.serve);
app.get(['/api/files/docs', '/api/files/docs/'], swaggerUi.setup(null, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Files Service API Docs',
  swaggerOptions: {
    persistAuthorization: true,
    url: '/api/files/docs/swagger.json',
  },
}));
app.get('/api/files/docs/swagger.json', (_req, res) => res.send(swaggerSpec));

// routes
app.use(createAppRouter());

// error handler
app.use(errorHandler);

app.listen(config.port, '0.0.0.0', () => {
  logger.info(`Files Service running on port ${config.port}`);
});

export default app;
