# Chai VC Platform

End-to-end healthcare credentialing and hiring verification.

## Development

The backend service is located in the `backend` directory. It exposes a GraphQL API powered by Express, Apollo Server and Prisma.

### Install Dependencies
```bash
cd backend
npm install
```

### Generate Prisma Client
The Prisma client requires engine downloads which may be blocked in restricted environments. If downloads fail, set `PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1` when running generate:
```bash
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npx prisma generate
```

### Start the Server
```bash
npm run dev
```
This starts the server on `http://localhost:4000/graphql` by default.
