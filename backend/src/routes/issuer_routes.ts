/**
 * Issuer routes for Pilot P0
 * POST /issuer/credential - Issue new credential
 * POST /issuer/revoke - Revoke existing credential
 */

import { Router, Request, Response } from 'express';
import { credentialStore } from '../services/store';
import { auditScrapbook } from '../services/audit';
import { createJwt } from '../services/jwt';
import { tryAnchor, generateHash } from '../services/polkadot_service';

export const issuerRoutes = Router();

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
 * Issue a new verifiable credential
 */
issuerRoutes.post('/credential', async (req: Request, res: Response) => {
  try {
    const { subject, validity }: IssueCredentialRequest = req.body;

    if (!subject?.id) {
      return res.status(400).json({
        error: 'Missing required field: subject.id'
      });
    }

    // Generate credential ID
    const credentialId = `cred-${Math.random().toString(36).substring(2, 15)}`;

    // Build VC payload
    const now = new Date();
    const validFrom = validity?.from || now.toISOString();
    const validUntil = validity?.until;

    const vcPayload = {
      jti: credentialId,
      credentialId,
      sub: subject.id,
      iss: 'VitalCV-Pilot',
      iat: Math.floor(now.getTime() / 1000),
      nbf: Math.floor(new Date(validFrom).getTime() / 1000),
      ...(validUntil && { exp: Math.floor(new Date(validUntil).getTime() / 1000) }),
      vc: {
        '@context': ['https://www.w3.org/2018/credentials/v1'],
        type: ['VerifiableCredential', 'HealthcareCredential'],
        credentialSubject: {
          id: subject.id,
          ...(subject.name && { name: subject.name }),
          ...(subject.licenseNumber && { licenseNumber: subject.licenseNumber }),
          ...(subject.licenseState && { licenseState: subject.licenseState })
        }
      }
    };

    // Sign to JWT
    const jwt = createJwt(vcPayload);

    // Store credential
    credentialStore.setIssued(credentialId, {
      jwt,
      subjectId: subject.id,
      validFrom,
      validUntil
    });

    // Non-blocking blockchain anchoring
    try {
      const hash = generateHash(jwt);
      tryAnchor(hash).catch(error => {
        console.warn(`[ISSUER] Anchoring failed for ${credentialId}:`, error.message);
      });
    } catch (error) {
      console.warn(`[ISSUER] Anchoring setup failed for ${credentialId}:`, error);
    }

    // Audit the issuance
    const auditRef = await auditScrapbook.record('issue', {
      credentialId,
      subjectId: subject.id
    });

    res.status(200).json({
      credentialId,
      jwt,
      auditRef
    });

  } catch (error) {
    console.error('[ISSUER] Credential issuance failed:', error);
    res.status(500).json({
      error: 'Internal server error during credential issuance'
    });
  }
});

/**
 * POST /issuer/revoke
 * Revoke an existing credential
 */
issuerRoutes.post('/revoke', async (req: Request, res: Response) => {
  try {
    const { credentialId }: RevokeCredentialRequest = req.body;

    if (!credentialId) {
      return res.status(400).json({
        error: 'Missing required field: credentialId'
      });
    }

    // Update credential status
    credentialStore.setStatus(credentialId, 'REVOKED');

    // Audit the revocation
    const auditRef = await auditScrapbook.record('revoke', {
      credentialId
    });

    res.status(200).json({
      ok: true,
      credentialId,
      auditRef
    });

  } catch (error) {
    console.error('[ISSUER] Credential revocation failed:', error);
    res.status(500).json({
      error: 'Internal server error during credential revocation'
    });
  }
});