#!/bin/bash
set -e

if [ -z "$DATABASE_URL" ]; then
  echo "DATABASE_URL is not set during Vercel build; using a temporary Prisma generate URL."
  export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/esign_build?schema=public"
fi

if [ -z "$DIRECT_URL" ]; then
  export DIRECT_URL="$DATABASE_URL"
fi

pnpm --filter @esign/utils build
pnpm --filter @esign/crypto build
pnpm --filter @esign/db build
pnpm --filter @esign/payments build
pnpm --filter @esign/web build
