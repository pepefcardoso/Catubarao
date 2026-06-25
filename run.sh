#!/bin/bash

echo "Starting infrastructure..."
docker compose up postgres pgbouncer redis -d

echo "Running database migrations..."
pnpm db:migrate

echo "Starting development server..."
pnpm dev
