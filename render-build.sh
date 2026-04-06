#!/bin/bash
set -e

echo "🔨 Render Build Script"
echo "   NODE_ENV: $NODE_ENV"
echo ""

# Install dependencies including dev dependencies (needed for TypeScript compilation)
echo "📦 Installing dependencies (including devDependencies)..."
unset NODE_ENV
pnpm install

# Now build with production environment
echo ""
echo "🏗️  Building backend packages..."
export NODE_ENV=production
pnpm run build

echo ""
echo "✅ Render build complete"
