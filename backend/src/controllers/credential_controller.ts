import { ACCEPT_PQ_SIGS } from '../config';

/**
 * Determines whether a given signature type is accepted.
 * ECDSA signatures are always accepted. Post-quantum (PQ)
 * signatures are conditionally accepted when the
 * `ACCEPT_PQ_SIGS` environment variable is set to "true".
 */
export function isSignatureAllowed(type: 'ECDSA' | 'PQ'): boolean {
  if (type === 'PQ') {
    return ACCEPT_PQ_SIGS;
  }
  return true;
}
