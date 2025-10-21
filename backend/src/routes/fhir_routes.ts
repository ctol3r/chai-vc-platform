/**
 * FHIR routes for Pilot P0.
 * GET /fhir/Practitioner/:id - Get practitioner resource with qualifications
 */

import { Router, Request, Response } from 'express';
import { credentialStore } from '../services/store';

const router = Router();

/**
 * GET /fhir/Practitioner/:id
 * Build a minimal FHIR R4 Practitioner resource with qualifications
 * derived from stored credentials.
 */
router.get('/Practitioner/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Find all credentials for this subject
    const credentials = await credentialStore.findBySubject(id);

    // Build qualifications array from active credentials
    const qualifications = credentials
      .filter(cred => cred.status === 'ACTIVE')
      .map(cred => ({
        identifier: [
          {
            system: 'https://vitalcv.io/credential',
            value: cred.credentialId,
          },
        ],
        code: {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/v2-0360',
              code: 'MD',
              display: 'Doctor of Medicine',
            },
          ],
          text: 'Healthcare Credential',
        },
        issuer: {
          display: 'VitalCV Platform',
        },
      }));

    // Build minimal FHIR R4 Practitioner resource
    const practitioner = {
      resourceType: 'Practitioner',
      id,
      meta: {
        profile: [
          'http://hl7.org/fhir/us/core/StructureDefinition/us-core-practitioner',
        ],
      },
      identifier: [
        {
          system: 'https://vitalcv.io/practitioner',
          value: id,
        },
      ],
      active: true,
      qualification: qualifications,
    };

    return res.status(200).json(practitioner);
  } catch (error: any) {
    console.error('[FHIR_ERROR]', { message: error?.message });
    return res.status(500).json({
      resourceType: 'OperationOutcome',
      issue: [
        {
          severity: 'error',
          code: 'processing',
          diagnostics: 'Failed to retrieve practitioner resource',
        },
      ],
    });
  }
});

export default router;
