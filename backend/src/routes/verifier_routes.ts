/**
 * Verifier routes for Pilot P0 API
 * Handles credential presentation verification
 */

import { Router, Request, Response } from 'express';
import store from '../services/store';
import { decodeJwt, verifySig, isExpired } from '../services/jwt';
import { recordVerify } from '../services/audit';

const router = Router();

interface VerifyPresentationRequest {
  jwt: string;
}

/**
 * POST /verifier/presentation
 * Verify a credential presentation
 */
router.post('/presentation', async (req: Request, res: Response) => {
  try {
    const { jwt }: VerifyPresentationRequest = req.body;
    
    // Check if JWT is provided
    if (!jwt) {
      return res.status(400).json({
        valid: false,
        reason: 'missing_jwt'
      });
    }
    
    // Verify JWT signature
    if (!verifySig(jwt)) {
      return res.status(400).json({
        valid: false,
        reason: 'bad_signature'
      });
    }
    
    // Decode JWT
    const payload = decodeJwt(jwt);
    if (!payload) {
      return res.status(400).json({
        valid: false,
        reason: 'invalid_jwt'
      });
    }
    
    // Extract credential ID
    const credentialId = payload.credentialId || payload.jti;
    if (!credentialId) {
      return res.status(400).json({
        valid: false,
        reason: 'missing_credential_id'
      });
    }
    
    // Check if credential exists in store
    const status = await store.getStatus(credentialId);
    if (!status) {
      return res.status(404).json({
        valid: false,
        reason: 'credential_not_found'
      });
    }
    
    // Check if JWT is expired
    if (isExpired(jwt)) {
      return res.json({
        valid: false,
        reason: 'expired',
        auditRef: await recordVerify(credentialId, 'expired'),
        credentialId
      });
    }
    
    // Check credential status
    const valid = status === 'ACTIVE';
    const reason = valid ? undefined : status.toLowerCase();
    
    // Record audit
    const auditRef = await recordVerify(credentialId, status);
    
    res.json({
      valid,
      reason,
      auditRef,
      credentialId
    });
    
  } catch (error) {
    console.error('Presentation verification error:', error);
    res.status(500).json({
      valid: false,
      reason: 'internal_error'
    });
  }
});

export default router;