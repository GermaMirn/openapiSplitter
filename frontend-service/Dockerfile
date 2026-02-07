FROM oven/bun:1 AS base
WORKDIR /app

# Install curl for healthcheck
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Create directories with proper permissions
RUN mkdir -p /tmp/.vite && chmod -R 777 /tmp/.vite

# Install dependencies
FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lock* /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

# Copy node_modules from temp directory
# Then copy all (non-ignored) project files into the image
FROM base AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

# Development
FROM base AS development
COPY --from=prerelease /app/node_modules node_modules
COPY --from=prerelease /app .
# Don't switch to bun user to avoid permission issues
# USER bun
ENTRYPOINT [ "sh", "-c", "bun install && exec bun run dev -- --host 0.0.0.0" ]
