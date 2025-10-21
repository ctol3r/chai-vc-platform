import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { store } from '../services/store';
import { tryAnchor } from '../services/polkadot_service';

const router = Router();

router.post('/issuer/credential', async (req: Request, res: Response) => {
  try {
    const { credentialSubject, issuer } = req.body;
    if (!credentialSubject || !issuer) {
      return res.status(400).json({ error: 'credentialSubject and issuer required' });
    }

    const credentialId = `cred-${crypto.randomBytes(16).toString('hex')}`;
    
    const credential = {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      type: ['VerifiableCredential'],
      id: credentialId,
      issuer,
      issuanceDate: new Date().toISOString(),
      credentialSubject,
    };

    const jwt = Buffer.from(JSON.stringify(credential)).toString('base64url');
    const hash = crypto.createHash('sha256').update(jwt).digest('hex');

    const subjectId = credentialSubject.id;
    store.setIssued(credentialId, { jwt, subjectId });

    await tryAnchor(hash);

    res.json({
      credentialId,
      jwt,
      auditRef: hash.slice(0, 16),
    });
  } catch (error) {
    console.error('Issue credential error:', error);
    res.status(500).json({ error: 'Failed to issue credential' });
  }
});

router.post('/issuer/revoke', async (req: Request, res: Response) => {
  try {
    const { credentialId } = req.body;
    if (!credentialId) {
      return res.status(400).json({ error: 'credentialId required' });
    }

    store.setStatus(credentialId, 'REVOKED');
    
    const auditRef = crypto.randomBytes(8).toString('hex');
    console.log('audit', { action: 'revoke', credentialId, auditRef, timestamp: Date.now() });

    res.json({ ok: true, credentialId, auditRef });
  } catch (error) {
    console.error('Revoke credential error:', error);
    res.status(500).json({ error: 'Failed to revoke credential' });
  }
});

export default router;
