import { Router } from 'express';
import { healthRouter } from '../controllers/health.controller';

export const registerRoutes = (app: Router): void => {
  app.use('/api/files/health', healthRouter);
};
