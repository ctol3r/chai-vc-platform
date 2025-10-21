import { Router } from 'express';
import crypto from 'crypto';
import { store } from '../services/store';

export const router = Router();

router.get('/verifier/credential/:credentialId/status', async (req, res) => {
  try {
    const status = store.getStatus(req.params.credentialId) || 'ACTIVE';
    res.json({ credentialId: req.params.credentialId, status });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to fetch credential status' });
  }
});

router.post('/verifier/presentation', async (req, res) => {
  try {
    const { jwt } = req.body;
    if (!jwt) {
      return res.status(400).json({ error: 'jwt required' });
    }

    let credential;
    try {
      const decoded = Buffer.from(jwt, 'base64url').toString('utf-8');
      credential = JSON.parse(decoded);
    } catch {
      return res.json({
        valid: false,
        reason: 'invalid_jwt_format',
      });
    }

    const credentialId = credential.id;
    if (!credentialId) {
      return res.json({
        valid: false,
        reason: 'missing_credential_id',
      });
    }

    const status = store.getStatus(credentialId);
    const auditRef = crypto.randomBytes(8).toString('hex');

    if (status === 'REVOKED') {
      return res.json({
        valid: false,
        reason: 'revoked',
        auditRef,
        credentialId,
      });
    }

    if (status === 'EXPIRED') {
      return res.json({
        valid: false,
        reason: 'expired',
        auditRef,
        credentialId,
      });
    }

    res.json({
      valid: true,
      auditRef,
      credentialId,
    });
  } catch (err) {
    console.error('Verify presentation error:', err);
    res.status(500).json({ error: 'Failed to verify presentation' });
  }
});
