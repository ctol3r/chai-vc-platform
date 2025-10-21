/**
 * Audit scrapbook for Pilot P0.
 * Records actions and optionally anchors hashes to chain.
 */

import crypto from 'crypto';
import { tryAnchor } from './polkadot_service';

export interface AuditDetails {
  [key: string]: any;
}

/**
 * Record an audit event and return an audit reference.
 * Optionally hashes the event and fires anchor to chain (non-blocking).
 */
export async function record(
  action: string,
  details: AuditDetails
): Promise<string> {
  const timestamp = Date.now();
  const randomSuffix = crypto.randomBytes(4).toString('hex');
  const auditRef = `${action}-${timestamp}-${randomSuffix}`;

  // Create hash of audit event
  const auditData = `${action}|${JSON.stringify(details)}|${timestamp}`;
  const hash = crypto.createHash('sha256').update(auditData).digest('hex');

  // Fire-and-forget anchor (non-blocking)
  tryAnchor(hash).catch(() => {
    // Already handled in tryAnchor, but catch just in case
  });

  // Log for audit trail (HIPAA: never log PII)
  console.log('[AUDIT]', { auditRef, action, timestamp });

  return auditRef;
}
