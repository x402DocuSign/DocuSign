# Use official Node.js runtime
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@9

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./

# Copy workspace packages
COPY packages ./packages
COPY apps ./apps

# Install dependencies with frozen lockfile
RUN pnpm install --frozen-lockfile --prefer-offline

# Build the project
RUN pnpm turbo build

# Expose ports
EXPOSE 3000 4000

# Start command (development)
CMD ["pnpm", "run", "start"]
