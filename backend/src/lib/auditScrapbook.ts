/**
 * In-memory AuditScrapbook for pilot
 * Logs events for issuer actions and claim processing
 * 
 * In production, this would integrate with the blockchain AuditScrapbook
 * or a persistent audit database
 */

export interface AuditEvent {
  eventId: string;
  timestamp: Date;
  eventType: string;
  claimId?: string;
  issuerId?: string;
  action: string;
  payload: Record<string, any>;
}

// In-memory store for pilot (replace with persistent storage in production)
const auditStore: AuditEvent[] = [];

/**
 * Log an audit event
 */
export function logAuditEvent(
  eventType: string,
  action: string,
  payload: Record<string, any> = {},
  claimId?: string,
  issuerId?: string
): AuditEvent {
  const event: AuditEvent = {
    eventId: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date(),
    eventType,
    claimId,
    issuerId,
    action,
    payload,
  };

  auditStore.push(event);

  // Keep only last 1000 events to avoid memory bloat (pilot only)
  if (auditStore.length > 1000) {
    auditStore.shift();
  }

  // Log to console for development
  console.info(`[AUDIT] ${event.timestamp.toISOString()} ${eventType}:${action}`, {
    eventId: event.eventId,
    claimId,
    issuerId,
    ...payload,
  });

  return event;
}

/**
 * Get audit events for a claim
 */
export function getAuditEventsForClaim(claimId: string): AuditEvent[] {
  return auditStore.filter((event) => event.claimId === claimId);
}

/**
 * Get all audit events (for debugging/monitoring)
 */
export function getAllAuditEvents(): AuditEvent[] {
  return [...auditStore];
}

/**
 * Get audit events by event type
 */
export function getAuditEventsByType(eventType: string): AuditEvent[] {
  return auditStore.filter((event) => event.eventType === eventType);
}
