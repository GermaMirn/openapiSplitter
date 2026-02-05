FROM oven/bun:1 AS base
WORKDIR /app

# Install dependencies
FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lockb* /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

# Install with --production (exclude devDependencies)
RUN mkdir -p /temp/prod
COPY package.json bun.lockb* /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile --production

# Copy node_modules from temp directory
# Then copy all (non-ignored) project files into the image
FROM base AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

# [optional] tests & build
ENV NODE_ENV=production

# Copy production dependencies and source code into final image
FROM base AS release
COPY --from=install /temp/prod/node_modules node_modules
COPY --from=prerelease /app/src ./src
COPY --from=prerelease /app/package.json ./
COPY --from=prerelease /app/tsconfig.json ./
COPY --from=prerelease /app/prisma ./prisma
COPY --from=prerelease /app/prisma.config.ts ./
COPY --from=prerelease /app/docker-entrypoint.sh ./

USER bun
ENTRYPOINT ["sh", "/app/docker-entrypoint.sh"]
CMD ["bun", "run", "src/index.ts"]

# Development stage
FROM base AS development
# Копируем package.json и устанавливаем зависимости
COPY package.json bun.lockb* ./
RUN bun install
# Копируем остальные файлы (включая prisma для миграций)
COPY . .
# При запуске: генерация клиента, миграции (с baseline при P3005), затем сервер
COPY docker-entrypoint.sh ./
ENTRYPOINT ["sh", "/app/docker-entrypoint.sh"]
CMD ["sh", "-c", "bun install && bunx prisma generate && bun run src/index.ts"]
