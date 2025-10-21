/**
 * Audit logging service for Pilot P0
 * Records actions and optionally anchors to blockchain
 */

import { tryAnchor, generateHash } from './polkadot_service';

export class AuditScrapbook {
  /**
   * Record an audit action and return audit reference
   */
  static async record(action: string, details: object): Promise<string> {
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const auditRef = `${action}-${timestamp}-${randomSuffix}`;

    // Log the audit entry (HIPAA-aware - no PII in logs)
    const sanitizedDetails = this.sanitizeForLogging(details);
    console.log(`[AUDIT] ${auditRef}:`, { action, details: sanitizedDetails, timestamp });

    // Optionally anchor to blockchain (non-blocking)
    try {
      const auditData = `${action}|${JSON.stringify(details)}|${timestamp}`;
      const hash = generateHash(auditData);
      
      // Fire and forget - don't await
      tryAnchor(hash).catch(error => {
        console.warn(`[AUDIT] Failed to anchor ${auditRef}:`, error.message);
      });
    } catch (error) {
      // Never let anchoring failure affect the audit record
      console.warn(`[AUDIT] Anchoring setup failed for ${auditRef}:`, error);
    }

    return auditRef;
  }

  /**
   * Sanitize details for logging - remove potential PII
   */
  private static sanitizeForLogging(details: any): any {
    if (!details || typeof details !== 'object') {
      return details;
    }

    const sanitized = { ...details };
    
    // Remove or hash potential PII fields
    const piiFields = ['name', 'licenseNumber', 'email', 'phone', 'address'];
    
    for (const field of piiFields) {
      if (sanitized[field]) {
        // Replace with hash for audit trail without exposing PII
        sanitized[field] = `[HASHED:${generateHash(String(sanitized[field])).substring(0, 8)}]`;
      }
    }

    return sanitized;
  }
}

// Export singleton pattern for convenience
export const auditScrapbook = AuditScrapbook;