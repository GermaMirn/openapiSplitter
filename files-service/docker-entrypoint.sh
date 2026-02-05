#!/bin/sh
set -e

bunx prisma generate

apply_migrations() {
  OUTPUT=$(bunx prisma migrate deploy 2>&1) || true
  echo "$OUTPUT"
  if echo "$OUTPUT" | grep -q "P3005"; then
    echo "Database schema not empty (P3005), baselining 20260204120000_init..."
    bunx prisma migrate resolve --applied "20260204120000_init"
  elif echo "$OUTPUT" | grep -q "Error:"; then
    exit 1
  fi
}

apply_migrations
exec "$@"
