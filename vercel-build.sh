#!/bin/bash
set -e

echo "========================================"
echo "🔨 Vercel Build Script Started"
echo "========================================"
echo "Node version: $(node --version)"
echo "pnpm version: $(pnpm --version)"

echo ""
echo "Step 1: Installing dependencies with pnpm..."
pnpm install --prefer-offline

echo ""
echo "Step 2: Building @esign/web frontend..."
pnpm --filter @esign/web build

echo ""
echo "========================================"
echo "✅ Build complete!"
echo "========================================"
