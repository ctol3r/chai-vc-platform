# Chai VC Platform

End-to-end healthcare credentialing and hiring verification.

## UI Component Libraries

This repository provides lightweight component libraries for building UI features
in both **React** and **Vue** projects. These components are intended to serve
as building blocks for common CHAI workflows such as displaying credential
information and requesting new credential verifications.

### React Components

Located under `frontend/components`:

- `CredentialDisplay.tsx` – shows credential details such as the holder and
  current status.
- `RequestForm.tsx` – simple form for submitting credential verification
  requests.

### Vue Components

Located under `frontend/vue-components`:

- `CredentialDisplay.vue` – Vue 3 component displaying credential information.
- `RequestForm.vue` – form used to emit verification requests.

These components have no external dependencies beyond React or Vue themselves
and can be imported directly into your application.
