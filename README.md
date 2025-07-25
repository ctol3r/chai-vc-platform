# Chai VC Platform

End-to-end healthcare credentialing and hiring verification.

## Provisional Attestations

For issuers that are not yet integrated with the platform, you can issue a provisional attestation. The backend exposes a helper function `offerProvisionalAttestation` which returns a temporary attestation object valid for a configurable number of days.

```typescript
import { offerProvisionalAttestation } from './backend/src/provisional_attestation';

const attestation = offerProvisionalAttestation('issuer-123');
```

This allows the platform to acknowledge an issuer while full integration is pending.
