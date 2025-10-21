/**
 * Audit logging service
 * HIPAA-aware: never log PII
 */

import * as crypto from 'crypto';
import { tryAnchor } from './polkadot_service';

/**
 * Generate audit reference
 */
function generateAuditRef(action: string): string {
  const timestamp = Date.now();
  const randomSuffix = crypto.randomBytes(4).toString('hex');
  return `${action}-${timestamp}-${randomSuffix}`;
}

/**
 * Hash audit data for anchoring
 */
function hashAuditData(action: string, details: object, timestamp: number): string {
  // Create deterministic string representation
  const dataString = `${action}|${JSON.stringify(details)}|${timestamp}`;
  return crypto.createHash('sha256').update(dataString).digest('hex');
}

/**
 * Sanitize details to remove any PII
 * HIPAA compliance: only log IDs and statuses, never names/SSNs/etc
 */
function sanitizeDetails(details: any): any {
  const safe: any = {};
  
  // Whitelist of safe fields to log
  const safeFields = [
    'credentialId',
    'subjectId',  // Assuming this is an opaque ID, not SSN
    'status',
    'action',
    'timestamp',
    'valid',
    'reason',
    'npi'  // NPI is public info
  ];
  
  for (const field of safeFields) {
    if (field in details) {
      safe[field] = details[field];
    }
  }
  
  return safe;
}

/**
 * AuditScrapbook class for singleton pattern
 */
class AuditScrapbookClass {
  private static instance: AuditScrapbookClass;
  private auditLog: Map<string, any>;

  private constructor() {
    this.auditLog = new Map();
  }

  static getInstance(): AuditScrapbookClass {
    if (!AuditScrapbookClass.instance) {
      AuditScrapbookClass.instance = new AuditScrapbookClass();
    }
    return AuditScrapbookClass.instance;
  }

  /**
   * Record an audit event
   * @param action - The action being audited (issue, revoke, verify)
   * @param details - Details about the action (will be sanitized)
   * @returns auditRef - Reference ID for the audit entry
   */
  async record(action: string, details: object): Promise<string> {
    const timestamp = Date.now();
    const auditRef = generateAuditRef(action);
    const sanitized = sanitizeDetails(details);
    
    // Store in memory for pilot
    const entry = {
      auditRef,
      action,
      details: sanitized,
      timestamp,
      iso8601: new Date(timestamp).toISOString()
    };
    
    this.auditLog.set(auditRef, entry);
    
    // Log for monitoring (no PII)
    console.log(`[AUDIT] ${action}`, {
      auditRef,
      timestamp: entry.iso8601,
      ...sanitized
    });
    
    // Hash and anchor (non-blocking)
    const hash = hashAuditData(action, sanitized, timestamp);
    tryAnchor(hash).catch(err => {
      // tryAnchor shouldn't throw, but be extra safe
      console.warn('Audit anchor failed:', err);
    });
    
    return auditRef;
  }

  /**
   * Retrieve audit entry (for testing/debugging)
   */
  async get(auditRef: string): Promise<any> {
    return this.auditLog.get(auditRef);
  }

  /**
   * Clear audit log (for testing)
   */
  clear(): void {
    this.auditLog.clear();
  }
}

// Export singleton instance
export const AuditScrapbook = AuditScrapbookClass.getInstance();

// Convenience function for recording
export async function record(action: string, details: object): Promise<string> {
  return AuditScrapbook.record(action, details);
}