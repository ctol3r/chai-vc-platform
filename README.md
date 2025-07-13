# Chai VC Platform

End-to-end healthcare credentialing and hiring verification.

## Keycloak Admin Audit Webhook

A new endpoint `/audit-webhook` accepts POST requests from Keycloak's admin event
webhook. Incoming events are logged to an immutable `AuditLog` table defined in
`backend/prisma/schema.prisma`.
