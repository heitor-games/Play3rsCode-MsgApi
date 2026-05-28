#!/bin/sh
set -e

echo "=== Server Startup ==="

# Try migrate with retries (database might not be ready yet)
ATTEMPTS=0
MAX_ATTEMPTS=20

until npx prisma migrate deploy 2>&1; do
  ATTEMPTS=$((ATTEMPTS+1))
  if [ $ATTEMPTS -eq $MAX_ATTEMPTS ]; then
    echo "ERROR: Migration failed after $MAX_ATTEMPTS attempts"
    exit 1
  fi
  echo "Migration attempt $ATTEMPTS failed, retrying in 5s..."
  sleep 5
done

echo "Migrations done!"
echo "Starting server..."
exec node dist/index.js
