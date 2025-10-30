# Workers

Background job processors using Bull queue.

## NPI Revalidation Worker

Scheduled worker that refreshes stale NPI data from the NPPES registry.

### Features

- **Concurrent Processing**: Processes 5 jobs simultaneously
- **Automatic Retries**: Exponential backoff with 3 attempts
- **Audit Logging**: All revalidation attempts are logged
- **Database Integration**: Queries Provider model for stale records

### Usage

#### Run as Standalone Process

```bash
npm run build
node dist/workers/npiRevalidateWorker.js
```

#### Programmatic Scheduling

```typescript
import { scheduleMonthlyRevalidate } from './workers/npiRevalidateWorker';

// Schedule all NPIs older than 30 days for revalidation
await scheduleMonthlyRevalidate();
```

### How It Works

1. `scheduleMonthlyRevalidate()` queries the database for providers with `last_verified_at` older than 30 days
2. Each stale NPI is enqueued as a Bull job
3. Worker processes jobs with concurrency limit of 5
4. Each job calls `refreshNPI()` which bypasses cache and fetches fresh data
5. Results are logged and persisted back to database

### Environment Requirements

- **Redis**: Required for Bull queue (same as `REDIS_URL`)
- **Database**: Access to Provider model (via Prisma)

### Job Data Structure

```typescript
{
  npi: string;  // 10-digit NPI to revalidate
}
```

### Error Handling

- Failed jobs are retried up to 3 times
- Exponential backoff: 1 minute, 2 minutes, 4 minutes
- All failures are audit-logged with error details

### Future Enhancements

- Merkle batch anchoring for audit trail
- Configurable revalidation intervals
- Webhook notifications on data changes
- Rate limiting to respect NPPES API limits
