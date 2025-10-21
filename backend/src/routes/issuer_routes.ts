/**
 * Issuer routes for credential issuance and revocation
 */

import { Router, Request, Response } from 'express';
import * as crypto from 'crypto';
import { store } from '../services/store';
import { createCredentialJWT, hashJWT } from '../services/jwt';
import { tryAnchor } from '../services/polkadot_service';
import { record } from '../services/audit';

// Simple ID generation for pilot
function generateId(): string {
  return crypto.randomBytes(6).toString('hex');
}

const router = Router();

/**
 * POST /issuer/credential
 * Issue a new verifiable credential
 */
router.post('/issuer/credential', async (req: Request, res: Response) => {
  try {
    const { subject, validity } = req.body;
    
    // Validate required fields
    if (!subject || !subject.id) {
      return res.status(400).json({
        error: 'Missing subject.id',
        valid: false,
        reason: 'invalid_request'
      });
    }
    
    // Generate credential ID
    const credentialId = `cred-${generateId()}`;
    
    // Prepare validity dates
    const now = new Date();
    const validFrom = validity?.from || now.toISOString();
    const validUntil = validity?.until || new Date(
      now.getTime() + 365 * 24 * 60 * 60 * 1000 // 1 year default
    ).toISOString();
    
    // Build minimal VC payload
    const vcPayload = {
      '@context': [
        'https://www.w3.org/2018/credentials/v1'
      ],
      type: ['VerifiableCredential', 'HealthcareCredential'],
      id: credentialId,
      credentialId,  // Also include as top-level field
      jti: credentialId,  // JWT ID claim
      sub: subject.id,
      credentialSubject: {
        id: subject.id,
        name: subject.name,
        licenseNumber: subject.licenseNumber,
        licenseState: subject.licenseState
      },
      issuanceDate: validFrom,
      expirationDate: validUntil,
      nbf: Math.floor(new Date(validFrom).getTime() / 1000),
      exp: Math.floor(new Date(validUntil).getTime() / 1000),
      vc: {
        credentialSubject: {
          id: subject.id,
          name: subject.name,
          licenseNumber: subject.licenseNumber,
          licenseState: subject.licenseState
        }
      }
    };
    
    // Create and sign JWT
    const jwt = createCredentialJWT(vcPayload);
    
    // Store in memory
    await store.setIssued(credentialId, {
      jwt,
      subjectId: subject.id,
      validFrom,
      validUntil
    });
    
    // Compute hash and anchor (non-blocking)
    const hash = hashJWT(jwt);
    tryAnchor(hash).catch(err => {
      console.warn('Credential anchor failed (non-blocking):', err);
    });
    
    // Record audit
    const auditRef = await record('issue', {
      credentialId,
      subjectId: subject.id
    });
    
    // Return success
    res.status(200).json({
      credentialId,
      jwt,
      auditRef
    });
    
  } catch (error) {
    console.error('Issue credential error:', error);
    res.status(500).json({
      error: 'Failed to issue credential',
      valid: false,
      reason: 'server_error'
    });
  }
});

/**
 * POST /issuer/revoke
 * Revoke an existing credential
 */
router.post('/issuer/revoke', async (req: Request, res: Response) => {
  try {
    const { credentialId } = req.body;
    
    // Validate required fields
    if (!credentialId) {
      return res.status(400).json({
        error: 'Missing credentialId',
        valid: false,
        reason: 'invalid_request'
      });
    }
    
    // Update status in store
    await store.setStatus(credentialId, 'REVOKED');
    
    // Record audit
    const auditRef = await record('revoke', { credentialId });
    
    // Optionally anchor revocation hash
    const revocationHash = hashJWT(`revoked:${credentialId}:${Date.now()}`);
    tryAnchor(revocationHash).catch(err => {
      console.warn('Revocation anchor failed (non-blocking):', err);
    });
    
    // Return success
    res.status(200).json({
      ok: true,
      credentialId,
      auditRef
    });
    
  } catch (error) {
    console.error('Revoke credential error:', error);
    res.status(500).json({
      error: 'Failed to revoke credential',
      valid: false,
      reason: 'server_error'
    });
  }
});

export default router;