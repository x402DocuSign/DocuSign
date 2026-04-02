#!/bin/bash
set -e

echo "===== ESSign Platform Build Script ====="
echo "Node version: $(node --version)"
echo "npm version: $(npm --version)"
echo "PWD: $(pwd)"

# Install pnpm if not already installed
npm install -g pnpm@9 || true

# Show pnpm version
pnpm --version

# Install dependencies with retries
echo "Installing dependencies with pnpm..."
max_attempts=5
attempt=1
while [ $attempt -le $max_attempts ]; do
  echo "Attempt $attempt/$max_attempts"
  if pnpm install --shamefully-hoist --frozen-lockfile=false; then
    echo "pnpm install succeeded"
    break
  else
    echo "pnpm install failed, retrying..."
    attempt=$((attempt + 1))
    sleep 10
  fi
done

# Check if installation succeeded
if [ $attempt -gt $max_attempts ]; then
  echo "❌ Failed to install dependencies after $max_attempts attempts"
  exit 1
fi

# Build with turbo
echo "Building with turbo..."
pnpm turbo build

echo "✅ Build completed successfully"
