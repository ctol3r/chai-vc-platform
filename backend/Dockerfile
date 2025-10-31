# Dockerfile for chai-vc-platform backend
# Multi-stage build with dev and production targets

# Development stage
FROM node:20-alpine AS dev

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install all dependencies (including dev dependencies)
RUN npm ci

# Copy source code
COPY . .

# Expose port
EXPOSE 4000

# Development command (uses nodemon)
CMD ["npm", "run", "dev"]

# Production build stage
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install all dependencies
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma client
RUN npm run prisma:generate

# Build TypeScript
RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy built files from build stage
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/prisma ./prisma

# Generate Prisma client in production
RUN npm run prisma:generate

# Expose port
EXPOSE 4000

# Start server
CMD ["npm", "start"]
