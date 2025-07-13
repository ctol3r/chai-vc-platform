# Chai VC Platform

End-to-end healthcare credentialing and hiring verification.

## GraphQL Server

Run `ts-node backend/src/graphql/clinician_resolver.ts` to start a simple GraphQL server. It exposes a `cliniciansBySpecialty` query returning clinicians filtered by specialty.

The frontend `verifier-search` page demonstrates a basic UI calling this resolver.
