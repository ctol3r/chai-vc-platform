# Chai VC Platform

End-to-end healthcare credentialing and hiring verification.

## DID Resolution

The backend now exposes a simple universal DID resolver that supports `did:web`, `did:ethr` and `did:key` methods. The resolver is implemented in `backend/src/did/universal_did_resolver.ts` using the `did-resolver` package and companion method resolvers. This utility can be imported and used anywhere within the backend:

```ts
import { defaultResolver } from './src/did/universal_did_resolver';

const doc = await defaultResolver.resolve('did:key:z6Mkw...');
```
