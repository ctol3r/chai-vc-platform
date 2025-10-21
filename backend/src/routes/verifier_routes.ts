/**
 * Verifier routes for credential presentation and verification
 */

import { Router, Request, Response } from 'express';
import { store } from '../services/store';
import { decodeJwt, verifySig } from '../services/jwt';
import { record } from '../services/audit';

const router = Router();

/**
 * POST /verifier/presentation
 * Verify a presented credential JWT
 */
router.post('/verifier/presentation', async (req: Request, res: Response) => {
  try {
    const { jwt } = req.body;
    
    // Check if JWT is provided
    if (!jwt) {
      return res.status(400).json({
        valid: false,
        reason: 'missing_jwt'
      });
    }
    
    // Verify signature
    const signatureValid = verifySig(jwt);
    if (!signatureValid) {
      const auditRef = await record('verify', {
        status: 'invalid_signature'
      });
      
      return res.status(200).json({
        valid: false,
        reason: 'bad_signature',
        auditRef
      });
    }
    
    // Decode JWT to get credential ID
    const payload = decodeJwt(jwt);
    const credentialId = payload.credentialId || payload.jti;
    
    if (!credentialId) {
      const auditRef = await record('verify', {
        status: 'missing_credential_id'
      });
      
      return res.status(200).json({
        valid: false,
        reason: 'missing_credential_id',
        auditRef
      });
    }
    
    // Get credential status from store
    const status = await store.getStatus(credentialId);
    
    // Determine validity
    const valid = status === 'ACTIVE';
    const reason = valid ? undefined : status.toLowerCase(); // 'revoked' or 'expired'
    
    // Record audit
    const auditRef = await record('verify', {
      credentialId,
      status
    });
    
    // Return verification result
    return res.status(200).json({
      valid,
      reason,
      auditRef,
      credentialId
    });
    
  } catch (error) {
    console.error('Verify presentation error:', error);
    
    const auditRef = await record('verify', {
      status: 'error',
      error: String(error)
    });
    
    res.status(500).json({
      valid: false,
      reason: 'server_error',
      auditRef
    });
  }
});

/**
 * GET /verifier/credential/:credentialId/status
 * Legacy endpoint for checking credential status (kept for compatibility)
 */
router.get('/verifier/credential/:credentialId/status', async (req: Request, res: Response) => {
  try {
    const { credentialId } = req.params;
    const status = await store.getStatus(credentialId);
    
    res.json({
      credentialId,
      status,
      valid: status === 'ACTIVE'
    });
  } catch (error) {
    console.error('Get credential status error:', error);
    res.status(500).json({
      error: 'Unable to fetch credential status',
      valid: false
    });
  }
});

export default router;