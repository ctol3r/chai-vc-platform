/**
 * Verifier routes for Pilot P0
 * POST /verifier/presentation - Verify presentation
 */

import { Router, Request, Response } from 'express';
import { credentialStore } from '../services/store';
import { auditScrapbook } from '../services/audit';
import { decodeJwt, verifySig } from '../services/jwt';

export const verifierRoutes = Router();

interface VerifyPresentationRequest {
  jwt: string;
}

/**
 * POST /verifier/presentation
 * Verify a verifiable presentation (JWT)
 */
verifierRoutes.post('/presentation', async (req: Request, res: Response) => {
  try {
    const { jwt }: VerifyPresentationRequest = req.body;

    // Check if JWT is provided
    if (!jwt) {
      return res.status(400).json({
        valid: false,
        reason: 'missing_jwt'
      });
    }

    // Verify signature
    if (!verifySig(jwt)) {
      const auditRef = await auditScrapbook.record('verify', {
        result: 'invalid_signature'
      });
      
      return res.status(200).json({
        valid: false,
        reason: 'bad_signature',
        auditRef
      });
    }

    // Decode JWT payload
    let payload;
    try {
      payload = decodeJwt(jwt);
    } catch (error) {
      const auditRef = await auditScrapbook.record('verify', {
        result: 'decode_failed'
      });
      
      return res.status(200).json({
        valid: false,
        reason: 'bad_signature',
        auditRef
      });
    }

    // Extract credential ID
    const credentialId = payload.credentialId || payload.jti;
    if (!credentialId) {
      const auditRef = await auditScrapbook.record('verify', {
        result: 'missing_credential_id'
      });
      
      return res.status(200).json({
        valid: false,
        reason: 'bad_signature',
        auditRef
      });
    }

    // Check credential status
    const status = await credentialStore.getStatus(credentialId);
    const valid = status === 'ACTIVE';
    const reason = valid ? undefined : status.toLowerCase();

    // Audit the verification
    const auditRef = await auditScrapbook.record('verify', {
      credentialId,
      status,
      result: valid ? 'valid' : 'invalid'
    });

    res.status(200).json({
      valid,
      reason,
      auditRef,
      credentialId
    });

  } catch (error) {
    console.error('[VERIFIER] Presentation verification failed:', error);
    
    // Still audit the failed attempt
    const auditRef = await auditScrapbook.record('verify', {
      result: 'system_error'
    });
    
    res.status(500).json({
      valid: false,
      reason: 'system_error',
      auditRef
    });
  }
});