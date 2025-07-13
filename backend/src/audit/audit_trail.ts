import fs from 'fs';
import path from 'path';

export type AuditEventType = 'PROFILE_VIEW' | 'DOWNLOAD' | 'HIRE';

export interface AuditEvent {
  timestamp: string;
  type: AuditEventType;
  userId: string;
  profileId: string;
}

const logFile = path.join(__dirname, 'audit_log.json');

function loadEvents(): AuditEvent[] {
  try {
    const data = fs.readFileSync(logFile, 'utf8');
    return JSON.parse(data) as AuditEvent[];
  } catch {
    return [];
  }
}

function saveEvents(events: AuditEvent[]) {
  fs.writeFileSync(logFile, JSON.stringify(events, null, 2));
}

export function recordEvent(event: AuditEvent): void {
  const events = loadEvents();
  events.push(event);
  saveEvents(events);
}

export function recordProfileView(userId: string, profileId: string): void {
  recordEvent({ timestamp: new Date().toISOString(), type: 'PROFILE_VIEW', userId, profileId });
}

export function recordDownload(userId: string, profileId: string): void {
  recordEvent({ timestamp: new Date().toISOString(), type: 'DOWNLOAD', userId, profileId });
}

export function recordHire(userId: string, profileId: string): void {
  recordEvent({ timestamp: new Date().toISOString(), type: 'HIRE', userId, profileId });
}

export function getAuditTrail(): AuditEvent[] {
  return loadEvents();
}
