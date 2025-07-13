# Chai VC Platform

End-to-end healthcare credentialing and hiring verification.

## AI Matcher Service

The repository includes a minimal matcher service implemented in Python.
Run `python3 ai-matcher-service/src/server.py` to start the HTTP server.

### Endpoint

- `GET /match/jobs/<clinicianId>` - returns a JSON payload containing a
  list of ranked jobs for the given clinician. The current implementation
  returns static sample data.
