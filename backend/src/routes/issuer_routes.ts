/**
 * Issuer routes for Pilot P0.
 * POST /issuer/credential - Issue a new credential
 * POST /issuer/revoke - Revoke a credential
 */

import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { credentialStore } from '../services/store';
import { createCredentialJWT } from '../services/jwt';
import { record } from '../services/audit';
import { tryAnchor } from '../services/polkadot_service';

const router = Router();

// Generate a nanoid-like short ID
function generateId(prefix: string = 'cred'): string {
  return `${prefix}-${crypto.randomBytes(8).toString('base64url')}`;
}

/**
 * POST /issuer/credential
 * Issue a new verifiable credential
 */
router.post('/credential', async (req: Request, res: Response) => {
  try {
    const { subject, validity } = req.body;

    if (!subject || !subject.id) {
      return res.status(400).json({
        error: 'missing_subject',
        message: 'Subject with id is required',
      });
    }

    const credentialId = generateId('cred');
    const issuedAt = new Date().toISOString();
    const validFrom = validity?.from || issuedAt;
    const validUntil = validity?.until;

    // Build minimal VC payload
    const vcPayload: any = {
      jti: credentialId,
      credentialId,
      sub: subject.id,
      iss: 'vitalcv-pilot-issuer',
      nbf: Math.floor(new Date(validFrom).getTime() / 1000),
      vc: {
        '@context': ['https://www.w3.org/2018/credentials/v1'],
        type: ['VerifiableCredential', 'HealthcareCredential'],
        credentialSubject: {
          id: subject.id,
          name: subject.name,
          licenseNumber: subject.licenseNumber,
          licenseState: subject.licenseState,
        },
      },
    };
    
    // Only add exp if validUntil is provided
    if (validUntil) {
      vcPayload.exp = Math.floor(new Date(validUntil).getTime() / 1000);
    }

    // Sign to JWT
    const jwt = createCredentialJWT(vcPayload);

    // Store in memory
    credentialStore.setIssued(credentialId, {
      jwt,
      subjectId: subject.id,
      validFrom,
      validUntil,
    });

    // Compute hash and fire-and-forget anchor
    const hash = crypto.createHash('sha256').update(jwt).digest('hex');
    tryAnchor(hash).catch(() => {
      // Already non-throwing, but extra safety
    });

    // Audit trail
    const auditRef = await record('issue', {
      credentialId,
      subjectId: subject.id,
    });

    return res.status(200).json({
      credentialId,
      jwt,
      auditRef,
    });
  } catch (error: any) {
    console.error('[ISSUER_ERROR]', { message: error?.message });
    return res.status(500).json({
      error: 'internal_error',
      message: 'Failed to issue credential',
    });
  }
});

/**
 * POST /issuer/revoke
 * Revoke an existing credential
 */
router.post('/revoke', async (req: Request, res: Response) => {
  try {
    const { credentialId } = req.body;

    if (!credentialId) {
      return res.status(400).json({
        error: 'missing_credential_id',
        message: 'credentialId is required',
      });
    }

    // Update status to REVOKED
    credentialStore.setStatus(credentialId, 'REVOKED');

    // Audit trail
    const auditRef = await record('revoke', { credentialId });

    return res.status(200).json({
      ok: true,
      credentialId,
      auditRef,
    });
  } catch (error: any) {
    console.error('[REVOKE_ERROR]', { message: error?.message });
    return res.status(500).json({
      error: 'internal_error',
      message: 'Failed to revoke credential',
    });
  }
});

export default router;
