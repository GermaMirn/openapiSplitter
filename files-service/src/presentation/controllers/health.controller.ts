import { Router, Request, Response } from 'express';
import { config } from '@/shared/config/config';
import { getRedis } from '@/infrastructure/redis';
import { prisma } from '@/infrastructure/database';

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

async function checkPostgres(): Promise<'ok' | 'down'> {
  try {
    await prisma.$queryRaw`SELECT 1`;
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
 *                   example: files-service
 *                 redis:
 *                   type: string
 *                   enum: [ok, down, disabled]
 *                   description: Статус подключения к Redis
 *                 postgres:
 *                   type: string
 *                   enum: [ok, down]
 *                   description: Статус подключения к PostgreSQL
 */
healthRouter.get('/', async (_req: Request, res: Response) => {
  const [redis, postgres] = await Promise.all([
    checkRedis(),
    checkPostgres(),
  ]);
  res.json({
    status: 'ok',
    service: 'files-service',
    redis,
    postgres,
  });
});
