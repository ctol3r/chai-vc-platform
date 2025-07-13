# Chai VC Platform

End-to-end healthcare credentialing and hiring verification.

## Security

Web sessions are automatically logged out after 15 minutes of inactivity to meet HIPAA idle-time logout requirements. The middleware implementing this logic is located in `backend/src/middleware/idle_timeout.ts`.
