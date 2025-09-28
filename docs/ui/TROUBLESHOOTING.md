# UI Troubleshooting Guide

## Common Errors and Solutions

### 1. 404 from /api Proxy

**Symptom**: Frontend requests to `/api/*` return 404 Not Found
```json
{"error": "proxy-failed", "message": "fetch failed"}
```

**Root Causes & Solutions**:

#### Backend Server Not Running
```bash
# Check if backend is running on expected port
curl http://localhost:4000/healthz
# If this fails, start backend:
cd backend && npm run dev
```

#### Wrong NEXT_PUBLIC_BACKEND_URL
```bash
# Check current environment variable
echo $NEXT_PUBLIC_BACKEND_URL

# Set correct backend URL (development)
export NEXT_PUBLIC_BACKEND_URL=http://localhost:4000

# Or add to .env.local in frontend directory
echo "NEXT_PUBLIC_BACKEND_URL=http://localhost:4000" >> frontend/.env.local
```

#### Port Conflicts
```bash
# Find what's using port 4000
lsof -i :4000

# Kill conflicting process
kill -9 <PID>

# Or start backend on different port
cd backend && PORT=4001 npm run dev
# Then update NEXT_PUBLIC_BACKEND_URL=http://localhost:4001
```

### 2. CORS Errors

**Symptom**: Browser console shows CORS policy errors
```
Access to fetch at 'http://localhost:4000/api/...' from origin 'http://localhost:3000' has been blocked by CORS policy
```

**Solution**: This indicates you're bypassing the proxy. Always use relative URLs:
```javascript
// ❌ Wrong: Direct backend calls cause CORS
fetch('http://localhost:4000/api/healthz')

// ✅ Correct: Proxy handles CORS
fetch('/api/healthz')
```

### 3. Network Connectivity Issues

**Symptom**: 502 Bad Gateway or connection timeout errors

#### Check Backend Health
```bash
# Test backend directly
curl -v http://localhost:4000/healthz

# If timeout, check backend logs:
cd backend && npm run dev  # Look for startup errors
```

#### Check Frontend-to-Backend Connection
```bash
# From frontend terminal, test proxy
curl http://localhost:3000/api/healthz

# Compare with direct backend call
curl http://localhost:4000/healthz
```

#### Firewall/Network Issues
```bash
# Test localhost connectivity
ping localhost

# Check if ports are accessible
telnet localhost 4000
telnet localhost 3000
```

### 4. Environment Variable Issues

**Symptom**: Proxy uses wrong backend URL in production

#### Verify Environment Loading
```bash
# In browser console (frontend page):
console.log(process.env.NEXT_PUBLIC_BACKEND_URL)

# Should show your backend URL, not undefined
```

#### Fix Environment Variables
```bash
# Development: Create .env.local
echo "NEXT_PUBLIC_BACKEND_URL=http://localhost:4000" > frontend/.env.local

# Production: Set environment variable
export NEXT_PUBLIC_BACKEND_URL=https://api.yourdomain.com

# Restart frontend after env changes
cd frontend && npm run dev
```

### 5. Health Endpoint Failures

**Symptom**: `/api/healthz` or `/api/readyz` return unexpected responses

#### Check Backend Endpoint Directly
```bash
# Test backend health endpoints
curl http://localhost:4000/healthz
curl http://localhost:4000/readyz

# Expected response:
# {"status": "healthy", "service": "chai-vc-backend", ...}
```

#### Check Frontend Proxy Response
```bash
# Test through frontend proxy
curl http://localhost:3000/api/healthz
curl http://localhost:3000/api/readyz

# Should match backend response exactly
```

#### Database Connection Issues
If `/readyz` shows database as disconnected:
```bash
# Check backend logs for database errors
cd backend && npm run dev  # Look for DB connection errors

# Verify database is running (if using external DB)
# Or check if backend is using mock DB connections
```

### 6. JSON Parsing Errors

**Symptom**: Frontend shows parsing errors for API responses

#### Check Response Content-Type
```bash
# Test with verbose output
curl -v http://localhost:3000/api/healthz

# Look for Content-Type header:
# < Content-Type: application/json
```

#### Test Raw Response
```bash
# Get raw response body
curl http://localhost:3000/api/healthz | cat -v

# Should be valid JSON, no HTML error pages
```

### 7. Development vs Production Issues

#### Frontend Build Issues
```bash
# Test production build locally
cd frontend
npm run build
npm run start

# Check for build-time environment variable issues
```

#### Backend Connection in Production
```bash
# Verify NEXT_PUBLIC_BACKEND_URL points to correct production backend
# Test production backend health:
curl https://your-backend-domain.com/healthz
```

## Quick Diagnostic Commands

### Full Health Check Sequence
```bash
# 1. Check backend directly
curl http://localhost:4000/healthz

# 2. Check frontend proxy
curl http://localhost:3000/api/healthz

# 3. Check frontend page loads
curl http://localhost:3000/verify

# 4. Check environment
cd frontend && npm run dev -- --debug
```

### Reset Development Environment
```bash
# Kill all node processes
pkill -f "node"

# Restart backend
cd backend && npm run dev &

# Restart frontend
cd frontend && npm run dev &

# Test connectivity
sleep 5 && curl http://localhost:3000/api/healthz
```

## When to Escalate

Contact **@backend-team** if:
- Backend health checks fail after restart
- Database connectivity issues persist
- Backend returns 500 errors consistently

Contact **@frontend-team** if:
- Proxy configuration seems incorrect
- Environment variables not loading properly
- Next.js build/startup issues

Contact **@platform-team** if:
- Network/infrastructure connectivity issues
- Production environment variable problems
- Load balancer/ingress configuration issues

---
**Owners**: @frontend-team @platform-team
**Last Updated**: 2025-01-15