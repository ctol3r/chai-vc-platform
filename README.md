# Chai VC Platform

End-to-end healthcare credentialing and hiring verification.

## Backend database setup

1. Install dependencies in the `backend` folder:

```bash
cd backend
npm install
```

2. Set the `DATABASE_URL` environment variable to point to your PostgreSQL instance.

3. Push the schema and seed the database:

```bash
npx prisma db push
npm run seed
```
