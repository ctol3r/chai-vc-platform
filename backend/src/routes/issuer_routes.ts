/**
 * Issuer routes for Pilot P0 API
 * Handles credential issuance and revocation
 */

import { Router, Request, Response } from 'express';
// Simple ID generator for pilot
function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
import store from '../services/store';
import { createJwt, JwtPayload } from '../services/jwt';
import { tryAnchor, hashJwt } from '../services/polkadot_service';
import { recordIssue, recordRevoke } from '../services/audit';

const router = Router();

interface IssueCredentialRequest {
  subject: {
    id: string;
    name?: string;
    licenseNumber?: string;
    licenseState?: string;
  };
  validity?: {
    from?: string;
    until?: string;
  };
}

interface RevokeCredentialRequest {
  credentialId: string;
}

/**
 * POST /issuer/credential
 * Issue a new credential
 */
router.post('/credential', async (req: Request, res: Response) => {
  try {
    const { subject, validity }: IssueCredentialRequest = req.body;
    
    // Validate required fields
    if (!subject || !subject.id) {
      return res.status(400).json({
        valid: false,
        reason: 'missing_subject_id'
      });
    }
    
    // Generate credential ID
    const credentialId = `cred-${generateId()}`;
    
    // Create JWT payload
    const now = Math.floor(Date.now() / 1000);
    const expTime = validity?.until ? Math.floor(new Date(validity.until).getTime() / 1000) : now + (365 * 24 * 60 * 60); // 1 year default
    
    // Ensure exp time is in the future
    const finalExpTime = expTime > now ? expTime : now + (365 * 24 * 60 * 60);
    const jwtPayload: JwtPayload = {
      jti: credentialId,
      credentialId,
      sub: subject.id,
      iss: 'vitalcv-pilot',
      nbf: now,
      exp: finalExpTime,
      credential: {
        type: 'ProfessionalCredential',
        subject: {
          id: subject.id,
          name: subject.name,
          licenseNumber: subject.licenseNumber,
          licenseState: subject.licenseState,
        },
        validFrom: validity?.from || new Date().toISOString(),
        validUntil: validity?.until || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      }
    };
    
    // Create JWT
    const jwt = createJwt(jwtPayload);
    
    // Store credential
    store.setIssued(credentialId, {
      jwt,
      subjectId: subject.id,
      validFrom: validity?.from,
      validUntil: validity?.until,
    });
    
    // Generate hash and attempt anchoring (non-blocking)
    const hash = hashJwt(jwt);
    tryAnchor(hash).catch(error => {
      console.warn('Credential anchoring failed (non-blocking):', error);
    });
    
    // Record audit
    const auditRef = await recordIssue(credentialId, subject.id);
    
    res.json({
      credentialId,
      jwt,
      auditRef
    });
    
  } catch (error) {
    console.error('Credential issuance error:', error);
    res.status(500).json({
      valid: false,
      reason: 'internal_error'
    });
  }
});

/**
 * POST /issuer/revoke
 * Revoke a credential
 */
router.post('/revoke', async (req: Request, res: Response) => {
  try {
    const { credentialId }: RevokeCredentialRequest = req.body;
    
    // Validate required fields
    if (!credentialId) {
      return res.status(400).json({
        valid: false,
        reason: 'missing_credential_id'
      });
    }
    
    // Check if credential exists
    if (!store.hasCredential(credentialId)) {
      return res.status(404).json({
        valid: false,
        reason: 'credential_not_found'
      });
    }
    
    // Revoke credential
    store.setStatus(credentialId, 'REVOKED');
    
    // Record audit
    const auditRef = await recordRevoke(credentialId);
    
    res.json({
      ok: true,
      credentialId,
      auditRef
    });
    
  } catch (error) {
    console.error('Credential revocation error:', error);
    res.status(500).json({
      valid: false,
      reason: 'internal_error'
    });
  }
});

export default router;