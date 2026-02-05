import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { config } from '@/shared/config/config';

/**
 * Prisma 7 с engine type "client" требует driver adapter для подключения к БД.
 * URL подключения — из общего конфига (единый источник правды).
 */
const adapter = new PrismaPg({ connectionString: config.database.url });

export const prisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});
