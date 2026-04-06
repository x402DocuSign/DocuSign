#!/bin/bash
set -e

echo "🔨 Building apps/web frontend..."

# Go to root and install
cd ../..
pnpm install --prefer-offline

# Generate Prisma
pnpm run db:generate

# Build the web app
pnpm --filter @esign/web build

echo "✅ Build complete!"
