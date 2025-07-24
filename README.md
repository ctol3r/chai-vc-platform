# Chai VC Platform

End-to-end healthcare credentialing and hiring verification.

## Backend APIs

A lightweight Express server provides REST and GraphQL endpoints with webhook handlers for Workday and SAP integrations.

### Run in development

```bash
cd backend
npm install
npm run dev
```

The server exposes the following routes:

- `POST /webhook/workday` – Webhook receiver for Workday events.
- `POST /webhook/sap` – Webhook receiver for SAP events.
- `GET /graphql` – GraphQL endpoint with a simple `status` query.
