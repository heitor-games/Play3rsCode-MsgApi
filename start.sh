#!/bin/sh
set -e

echo "=== Server Startup ==="
echo "Waiting for database..."

# Wait for database to be ready (max 30 attempts)
ATTEMPTS=0
MAX_ATTEMPTS=30
until npx prisma migrate status > /dev/null 2>&1 || [ $ATTEMPTS -eq $MAX_ATTEMPTS ]; do
  echo "Database not ready, waiting... (attempt $((ATTEMPTS+1))/$MAX_ATTEMPTS)"
  sleep 2
  ATTEMPTS=$((ATTEMPTS+1))
done

if [ $ATTEMPTS -eq $MAX_ATTEMPTS ]; then
  echo "ERROR: Database not ready after $MAX_ATTEMPTS attempts"
  exit 1
fi

echo "Database ready!"
echo "Running Prisma migrations..."
npx prisma migrate deploy

echo "Migrations done!"
echo "Starting server..."
exec node dist/index.js
