# Chai VC Platform

End-to-end healthcare credentialing and hiring verification.

## Authentication Middleware

The backend uses JWT tokens issued by Keycloak. Provide the public key via the `KEYCLOAK_PUBLIC_KEY` environment variable. The middleware verifies the token and enforces role-based access control for `clinician`, `issuer`, `verifier` and `admin` roles.

Run the development server:

```bash
cd backend
npm install
npm run dev
```
