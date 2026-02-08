import { Router, Request, Response } from 'express';
import { config } from '@/shared/config/config';
import { getRedis } from '@/infrastructure/redis';

export const healthRouter = Router();

async function checkRedis(): Promise<'ok' | 'down' | 'disabled'> {
  if (!config.redis.url) return 'disabled';
  const redis = getRedis(config.redis.url);
  if (!redis) return 'down';
  try {
    await redis.ping();
    return 'ok';
  } catch {
    return 'down';
  }
}

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 service:
 *                   type: string
 *                   example: openapi-splitter-service
 *                 redis:
 *                   type: string
 *                   enum: [ok, down, disabled]
 *                   description: Статус подключения к Redis
 */
healthRouter.get('/', async (_req: Request, res: Response) => {
  const redis = await checkRedis();
  res.json({
    status: 'ok',
    service: 'openapi-splitter-service',
    redis,
  });
});
