# Chai VC Platform

End-to-end healthcare credentialing and hiring verification.

## Backend Development

The backend now includes a small Express setup with middleware for request
validation and centralized error handling. To run the server locally:

```bash
cd backend
npm install
npm start
```

The `/credentials` endpoint expects `name` and `issuer` fields in the request
body. Invalid input results in a structured error response.
