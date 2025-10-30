# Environment Setup Guide

This document outlines the required environment variables for the Chai VC Platform backend.

## Required Environment Variables

### Redis Configuration
```bash
REDIS_URL=redis://localhost:6379
```
- **Purpose**: Used for caching NPI lookups and Bull queue job processing
- **Default**: `redis://localhost:6379`
- **Required**: Yes (for production)

### NPPES Integration
```bash
NPPES_PROXY_URL=http://internal-nppes-proxy:8080
```
- **Purpose**: Internal proxy URL for NPPES API lookups (avoids CORS, centralizes rate limiting)
- **Default**: Falls back to direct CMS NPPES API call
- **Required**: No (but recommended for production)
- **Note**: If not set, the service will call `https://npiregistry.cms.hhs.gov/api` directly

### Backend Base URL
```bash
BACKEND_BASE_URL=http://localhost:4000
```
- **Purpose**: Base URL for internal service calls
- **Default**: Not set
- **Required**: No (only needed if using internal proxy patterns)

### Database
```bash
DATABASE_URL=file:./dev.db
```
- **Purpose**: Prisma database connection string
- **Default**: SQLite `file:./dev.db` (as configured in `prisma/schema.prisma`)
- **Required**: Yes

## Development Setup

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Set up Redis:**
   ```bash
   # Using Docker
   docker run -d -p 6379:6379 redis:7-alpine
   
   # Or install locally
   # macOS: brew install redis && brew services start redis
   # Linux: apt-get install redis-server && systemctl start redis
   ```

3. **Set up database:**
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

4. **Set environment variables:**
   ```bash
   # Create .env file in backend directory
   cp .env.example .env
   # Edit .env with your values
   ```

5. **Start the server:**
   ```bash
   npm run dev
   ```

## Production Considerations

- Use a managed Redis service (AWS ElastiCache, Redis Cloud, etc.)
- Set up a proper NPPES proxy with rate limiting and caching
- Use a production-grade database (PostgreSQL recommended)
- Configure proper authentication/authorization middleware
- Set up Prometheus scraping for `/metrics` endpoint
- Configure worker processes for background jobs

## Worker Setup

The NPI revalidation worker requires:
- Redis connection (same as above)
- Access to the same database
- Can be run as a separate process:

```bash
# Build first
npm run build

# Run worker
node dist/workers/npiRevalidateWorker.js
```

## Testing Environment Variables

For running tests, you may want to use a test Redis instance:

```bash
REDIS_URL=redis://localhost:6380
DATABASE_URL=file:./test.db
```
