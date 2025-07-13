# Chai VC Platform

End-to-end healthcare credentialing and hiring verification.

## Audit Trail

The backend includes a simple audit trail used by verifiers. Events are logged to
`backend/src/audit/audit_log.json`. Utility functions are available to record
profile views, credential downloads, and successful hires.
