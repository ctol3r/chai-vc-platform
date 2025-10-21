/**
 * FHIR Practitioner routes for Pilot P0 API
 * Builds FHIR R4 Practitioner resources from stored credentials
 */

import { Router, Request, Response } from 'express';
import store from '../services/store';
import { recordFhirLookup } from '../services/audit';
import { validateParams, practitionerParamSchema } from '../middleware/validate';
import { logger } from '../services/logger';

const router = Router();

/**
 * GET /fhir/Practitioner/:id
 * Get FHIR R4 Practitioner resource for a subject ID
 */
router.get('/Practitioner/:id', validateParams(practitionerParamSchema), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        valid: false,
        reason: 'missing_practitioner_id'
      });
    }
    
    // Find all credentials for this subject
    const credentials = await store.findBySubject(id);
    
    if (credentials.length === 0) {
      await recordFhirLookup(id, false);
      return res.status(404).json({
        valid: false,
        reason: 'practitioner_not_found'
      });
    }
    
    // Build qualifications from credentials
    const qualifications = credentials
      .filter(cred => cred.status === 'ACTIVE')
      .map(cred => {
        const credentialRecord = store.getCredential(cred.credentialId);
        const jwt = credentialRecord?.jwt;
        
        // Parse JWT payload to extract credential information
        let credentialData: any = {};
        if (jwt) {
          try {
            const payload = JSON.parse(Buffer.from(jwt.split('.')[1], 'base64url').toString());
            credentialData = payload.credential || {};
          } catch (error) {
            console.warn('Failed to parse JWT for credential:', cred.credentialId);
          }
        }
        
        return {
          identifier: [
            {
              use: 'official',
              value: cred.credentialId,
              system: 'https://vitalcv.com/credentials'
            }
          ],
          code: {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/v2-0360',
                code: 'MD',
                display: 'Medical Doctor'
              }
            ],
            text: 'Professional Credential'
          },
          period: {
            start: credentialData.validFrom || new Date().toISOString(),
            end: credentialData.validUntil || undefined
          },
          issuer: {
            display: 'VitalCV Platform'
          }
        };
      });
    
    // Build FHIR R4 Practitioner resource
    const practitioner = {
      resourceType: 'Practitioner',
      id: id,
      identifier: [
        {
          use: 'official',
          value: id,
          system: 'https://vitalcv.com/practitioners'
        }
      ],
      name: [
        {
          use: 'official',
          text: credentials[0]?.credentialId ? 'Practitioner' : 'Unknown'
        }
      ],
      qualification: qualifications,
      meta: {
        profile: ['http://hl7.org/fhir/StructureDefinition/Practitioner'],
        lastUpdated: new Date().toISOString()
      }
    };
    
    // Record successful lookup
    await recordFhirLookup(id, true);
    
    res.json(practitioner);
    
  } catch (error) {
    console.error('FHIR Practitioner lookup error:', error);
    await recordFhirLookup(req.params.id, false);
    res.status(500).json({
      valid: false,
      reason: 'internal_error'
    });
  }
});

export default router;