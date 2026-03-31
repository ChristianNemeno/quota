#!/bin/sh
# scripts/db-push.sh
# Pushes the Prisma schema to the database.
# Run from the project root directory after `docker compose up -d db`.

set -e

if [ -f .env ]; then
  # shellcheck disable=SC2046
  export $(grep -v '^#' .env | xargs)
fi

if [ -z "$POSTGRES_PASSWORD" ]; then
  echo "Error: POSTGRES_PASSWORD is not set. Add it to your .env file."
  exit 1
fi

docker run --rm \
  --network quota_default \
  -e DATABASE_URL="postgresql://quota:${POSTGRES_PASSWORD}@db:5432/quota" \
  -v "$(pwd)/prisma:/app/prisma:ro" \
  -v "$(pwd)/prisma.config.ts:/app/prisma.config.ts:ro" \
  -v "$(pwd)/package.json:/app/package.json:ro" \
  -v "$(pwd)/package-lock.json:/app/package-lock.json:ro" \
  -w /app \
  node:20-alpine \
  sh -c "npm ci --include=dev --silent && npx prisma generate && npx prisma db push"

echo "Done."
