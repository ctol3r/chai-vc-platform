import { Router } from 'express';
import { randomUUID } from 'crypto';
import { getStore } from '../services/store';
import { signPilotJwt } from '../services/jwt';
import { record } from '../services/audit';
import { createHash } from 'crypto';
import { tryAnchor } from '../services/polkadot_service';

export const issuerRoutes = Router();

issuerRoutes.post('/issuer/credential', async (req, res) => {
  try {
    const subject = req.body?.subject as { id: string; name?: string; licenseNumber?: string; licenseState?: string };
    const validity = req.body?.validity as { from?: string; until?: string } | undefined;

    if (!subject || typeof subject.id !== 'string' || subject.id.trim().length === 0) {
      return res.status(400).json({ error: 'invalid_subject' });
    }

    const credentialId = `cred-${randomUUID().replace(/-/g, '')}`;

    const payload: any = {
      iss: 'vitalcv:pilot',
      sub: subject.id,
      jti: credentialId,
      credentialId,
      nbf: validity?.from ? Math.floor(Date.parse(validity.from) / 1000) : undefined,
      exp: validity?.until ? Math.floor(Date.parse(validity.until) / 1000) : undefined,
    };

    const jwt = signPilotJwt(payload);

    const store = getStore();
    await store.setIssued(credentialId, {
      jwt,
      subjectId: subject.id,
      validFrom: validity?.from,
      validUntil: validity?.until,
    });

    const hash = createHash('sha256').update(jwt).digest('hex');
    Promise.resolve(tryAnchor(hash)).catch(() => undefined);

    const auditRef = await record('issue', { credentialId, subjectId: subject.id });

    return res.status(200).json({ credentialId, jwt, auditRef });
  } catch (e: any) {
    return res.status(500).json({ error: 'issue_failed' });
  }
});

issuerRoutes.post('/issuer/revoke', async (req, res) => {
  try {
    const credentialId = req.body?.credentialId as string;
    if (!credentialId || typeof credentialId !== 'string') {
      return res.status(400).json({ error: 'invalid_credentialId' });
    }

    const store = getStore();
    await store.setStatus(credentialId, 'REVOKED');
    const auditRef = await record('revoke', { credentialId });

    return res.status(200).json({ ok: true, credentialId, auditRef });
  } catch (e: any) {
    return res.status(500).json({ error: 'revoke_failed' });
  }
});
