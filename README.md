# Chai VC Platform

End-to-end healthcare credentialing and hiring verification.

## Backend GraphQL API

The backend now includes a simple GraphQL API powered by Apollo Server.
Resolvers use Prisma Client to perform CRUD operations on a `Credential`
model defined in `prisma/schema.prisma`.

Run the server with:

```bash
cd backend
npm install
npx prisma generate   # requires internet for Prisma engines
npm start
```
