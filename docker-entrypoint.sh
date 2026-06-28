#!/bin/sh
set -e

echo "Starting OpenWorkpaper entrypoint script..."

# Set a default DATABASE_URL if not provided
if [ -z "$DATABASE_URL" ]; then
  export DATABASE_URL="file:/app/prisma/data/dev.db"
  echo "Using default DATABASE_URL: $DATABASE_URL"
fi

if [ -z "$PRISMA_SCHEMA_MODE" ]; then
  export PRISMA_SCHEMA_MODE="push"
  echo "Using default PRISMA_SCHEMA_MODE: $PRISMA_SCHEMA_MODE"
fi

if [ -z "$PREFILL_QUESTIONS_FILE" ]; then
  export PREFILL_QUESTIONS_FILE="/app/Prefill_Questions_All.md"
  echo "Using default PREFILL_QUESTIONS_FILE: $PREFILL_QUESTIONS_FILE"
fi

# Extract the path from the file: URL
DB_PATH=$(echo "$DATABASE_URL" | sed 's|file:||')
DB_DIR=$(dirname "$DB_PATH")

# Ensure the directory for the database exists
if [ ! -d "$DB_DIR" ]; then
  echo "Creating database directory: $DB_DIR"
  mkdir -p "$DB_DIR"
fi

echo "Database directory diagnostics:"
ls -ld "$DB_DIR"
if [ -f "$DB_PATH" ]; then
  echo "Database file exists at $DB_PATH"
  ls -l "$DB_PATH"
else
  echo "Database file does not exist yet at $DB_PATH"
fi

# Run Prisma db push to ensure DB schema is created
# Using the binary directly to avoid npx/npm overhead and potential cache issues
PRISMA_BIN="./node_modules/.bin/prisma"

if [ -f "$PRISMA_BIN" ]; then
  echo "Initializing database schema with $PRISMA_BIN (mode: $PRISMA_SCHEMA_MODE)..."
  if [ "$PRISMA_SCHEMA_MODE" = "migrate" ]; then
    $PRISMA_BIN migrate deploy
  else
    $PRISMA_BIN db push --accept-data-loss
  fi
  
  echo "Seeding database..."
  $PRISMA_BIN db seed

  echo "Backfilling template questions from markdown..."
  node prisma/backfill-template-questions.mjs
else
  echo "WARNING: Prisma binary not found at $PRISMA_BIN. Attempting to use npx prisma..."
  if [ "$PRISMA_SCHEMA_MODE" = "migrate" ]; then
    npx prisma migrate deploy
  else
    npx prisma db push --accept-data-loss
  fi
  npx prisma db seed
  node prisma/backfill-template-questions.mjs
fi

# Start the application
echo "Starting OpenWorkpaper application..."
exec node server.js
