#!/bin/sh
# scripts/seed.sh
# Seeds the database with initial quotes.
#
# WARNING: This DELETES all existing quotes, tags, and relations before inserting.
# Do not run this on a database with data you want to keep.
#
# Requires: Docker running with the db service healthy (docker compose up -d db)
# Run from the project root directory.

set -e

# Load POSTGRES_PASSWORD from .env
if [ -f .env ]; then
  # shellcheck disable=SC2046
  export $(grep -v '^#' .env | xargs)
fi

if [ -z "$POSTGRES_PASSWORD" ]; then
  echo "Error: POSTGRES_PASSWORD is not set. Add it to your .env file."
  exit 1
fi

echo "WARNING: This will DELETE all existing data and re-seed the database."
printf "Press Enter to continue, or Ctrl+C to abort... "
read -r _

# The production app image (standalone build) does not include tsx or devDependencies,
# so seeding is done via a temporary node:20-alpine container with deps installed.
docker run --rm \
  --network quota_default \
  -e DATABASE_URL="postgresql://quota:${POSTGRES_PASSWORD}@db:5432/quota" \
  -v "$(pwd)/prisma:/app/prisma:ro" \
  -v "$(pwd)/package.json:/app/package.json:ro" \
  -v "$(pwd)/package-lock.json:/app/package-lock.json:ro" \
  -w /app \
  node:20-alpine \
  sh -c "npm ci --include=dev --silent && npx prisma generate && npx tsx prisma/seed.ts"

echo "Seeding complete."
