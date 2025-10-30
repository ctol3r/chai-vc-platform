# Services

This directory contains business logic services for the Chai VC Platform.

## NPPES Service (`nppesService.ts`)

Service for looking up National Provider Identifier (NPI) information from the CMS NPPES registry.

### Features

- **Caching**: Redis cache with 24-hour TTL to reduce API calls
- **Database Persistence**: Upserts provider data to Prisma Provider model
- **Proxy Support**: Can use internal proxy or direct CMS API calls
- **Metrics**: Tracks cache hits, misses, successes, and errors
- **Audit Logging**: All lookups are audit-logged

### Usage

```typescript
import { lookupNPI, refreshNPI } from '../services/nppesService';

// Lookup with caching
const provider = await lookupNPI('1234567893');

// Force refresh (bypass cache)
const freshProvider = await refreshNPI('1234567893');
```

### Environment Variables

- `REDIS_URL`: Redis connection string for caching
- `NPPES_PROXY_URL`: Optional internal proxy URL (recommended for production)

### Prisma Schema Requirement

The service expects a `Provider` model in your Prisma schema:

```prisma
model Provider {
  npi       String   @id
  data      Json
  last_verified_at DateTime
}
```

If the model doesn't exist, the service will gracefully degrade (logs a warning but continues).
