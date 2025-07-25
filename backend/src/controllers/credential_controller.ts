import { loadVcContext } from '../credential_registry';

// credential_controller.ts - demonstrates how the credential registry pallet
// integrates the W3C VC Data Model 1.0 schema.

export function getCredentialContext() {
  return loadVcContext();
}
