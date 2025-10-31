# Backend TODO Items

## NPPES API v2.1 Integration

### Overview
Integrate the National Plan and Provider Enumeration System (NPPES) API v2.1 to fetch provider information for NPI lookups.

### Environment Variables
Add the following environment variables to `.env` or your deployment configuration:

```bash
# NPPES API Configuration
NPPES_API_KEY=<your-api-key-here>
NPPES_API_BASE_URL=https://npiregistry.cms.hhs.gov/api/
NPPES_API_VERSION=v2.1
```

**Note:** Do NOT commit actual API keys to version control. Use environment variables or a secrets management system.

### Implementation Details

1. **API Endpoint Template**
   ```
   GET {NPPES_API_BASE_URL}/{NPPES_API_VERSION}?number={npi}&version=2.1&api_key={NPPES_API_KEY}
   ```

2. **Request Headers**
   ```
   Accept: application/json
   User-Agent: chai-vc-platform-backend/1.0.0
   ```

3. **Integration Points**
   - Update `src/routes/claim.ts` → `POST /api/npi/lookup` endpoint
   - Replace in-memory `npiStore` with actual NPPES API calls
   - Implement caching layer to reduce API calls
   - Add error handling for API failures (rate limits, network errors)

4. **Response Structure**
   The NPPES API returns provider information including:
   - Provider name (individual or organization)
   - Primary taxonomy/specialty
   - Address information
   - Provider type (NPI-1: Individual, NPI-2: Organization)

5. **Caching Strategy**
   - Cache successful NPI lookups for 24-48 hours
   - Consider using Redis or in-memory cache with TTL
   - Implement cache invalidation on update

6. **Error Handling**
   - Handle rate limiting (429 responses)
   - Handle invalid API keys (401 responses)
   - Handle network timeouts
   - Fallback to cached data when available
   - Log errors for monitoring

### Testing
- Unit tests for NPPES API client
- Integration tests with mock NPPES responses
- Error scenario testing (rate limits, network failures)

### Documentation
- Update API documentation with NPPES integration details
- Document environment variable requirements
- Add examples for API usage

### Priority
**Medium** - Currently using in-memory pilot stores. NPPES integration is needed for production readiness.

### Estimated Effort
2-3 days (including testing and documentation)

---
