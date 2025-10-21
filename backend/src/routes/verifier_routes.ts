/**
 * Verifier routes for Pilot P0.
 * POST /verifier/presentation - Verify a credential presentation
 */

import { Router, Request, Response } from 'express';
import { credentialStore } from '../services/store';
import { decodeJwt, verifySig } from '../services/jwt';
import { record } from '../services/audit';

const router = Router();

/**
 * POST /verifier/presentation
 * Verify a credential JWT presentation
 */
router.post('/presentation', async (req: Request, res: Response) => {
  try {
    const { jwt } = req.body;

    // Check if JWT is provided
    if (!jwt) {
      return res.status(400).json({
        valid: false,
        reason: 'missing_jwt',
      });
    }

    // Verify signature
    const sigValid = verifySig(jwt);
    if (!sigValid) {
      return res.status(200).json({
        valid: false,
        reason: 'bad_signature',
      });
    }

    // Decode JWT payload
    const payload = decodeJwt(jwt);
    if (!payload) {
      return res.status(200).json({
        valid: false,
        reason: 'malformed_jwt',
      });
    }

    // Extract credential ID (prefer explicit credentialId, fallback to jti)
    const credentialId = payload.credentialId || payload.jti;
    if (!credentialId) {
      return res.status(200).json({
        valid: false,
        reason: 'missing_credential_id',
      });
    }

    // Check status from store
    const status = await credentialStore.getStatus(credentialId);
    const valid = status === 'ACTIVE';
    const reason = valid ? undefined : status.toLowerCase();

    // Audit trail
    const auditRef = await record('verify', {
      credentialId,
      status,
    });

    return res.status(200).json({
      valid,
      reason,
      auditRef,
      credentialId,
    });
  } catch (error: any) {
    console.error('[VERIFIER_ERROR]', { message: error?.message });
    return res.status(500).json({
      valid: false,
      reason: 'internal_error',
    });
  }
});

export default router;
