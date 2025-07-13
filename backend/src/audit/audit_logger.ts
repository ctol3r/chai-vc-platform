import fs from 'fs';
import path from 'path';

/**
 * Record an audit log entry for issuer-related actions.
 *
 * @param action - Description of the issuer action performed.
 * @param details - Optional metadata associated with the action.
 */
export function recordIssuerAction(action: string, details: unknown = {}): void {
  const logEntry = {
    timestamp: new Date().toISOString(),
    action,
    details,
  };

  const logDir = path.join(__dirname, '..', '..', '..', 'logs');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  const logFile = path.join(logDir, 'issuer_audit.log');
  fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
}
