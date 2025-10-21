import { randomBytes, createHash } from 'crypto';
import { tryAnchor } from './polkadot_service';

export async function record(action: string, details: object): Promise<string> {
  const suffix = randomBytes(4).toString('hex');
  const auditRef = `${action}-${Date.now()}-${suffix}`;

  try {
    const payload = `${action}|${JSON.stringify(details)}|${auditRef}`;
    const hash = createHash('sha256').update(payload).digest('hex');
    // Fire-and-forget; never block request lifecycle
    Promise.resolve(tryAnchor(hash)).catch(() => undefined);
  } catch {
    // swallow any hashing/anchoring errors
  }

  return auditRef;
}
