/**
 * FHIR routes for Pilot P0
 * GET /fhir/Practitioner/:id - Get FHIR Practitioner resource
 */

import { Router, Request, Response } from 'express';
import { credentialStore } from '../services/store';

export const fhirRoutes = Router();

/**
 * GET /fhir/Practitioner/:id
 * Build FHIR R4 Practitioner resource with qualifications from stored credentials
 */
fhirRoutes.get('/Practitioner/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        resourceType: 'OperationOutcome',
        issue: [{
          severity: 'error',
          code: 'required',
          details: {
            text: 'Practitioner ID is required'
          }
        }]
      });
    }

    // Find credentials for this subject
    const credentials = await credentialStore.findBySubject(id);

    // Build qualifications from active credentials
    const qualifications = credentials
      .filter(cred => cred.status === 'ACTIVE')
      .map((cred, index) => {
        // Get credential details from store
        const record = credentialStore.getRecord(cred.credentialId);
        
        return {
          identifier: [{
            value: cred.credentialId,
            system: 'https://vitalcv.com/credential-id'
          }],
          code: {
            coding: [{
              system: 'http://terminology.hl7.org/CodeSystem/v2-0360',
              code: 'MD',
              display: 'Healthcare Professional'
            }],
            text: 'Healthcare Professional Credential'
          },
          period: {
            ...(record?.validFrom && { start: record.validFrom }),
            ...(record?.validUntil && { end: record.validUntil })
          },
          issuer: {
            display: 'VitalCV Credential Platform'
          }
        };
      });

    // Build minimal FHIR Practitioner resource
    const practitioner = {
      resourceType: 'Practitioner',
      id,
      meta: {
        versionId: '1',
        lastUpdated: new Date().toISOString(),
        profile: ['http://hl7.org/fhir/StructureDefinition/Practitioner']
      },
      identifier: [{
        system: 'https://vitalcv.com/practitioner-id',
        value: id
      }],
      active: qualifications.length > 0,
      qualification: qualifications
    };

    res.status(200).json(practitioner);

  } catch (error) {
    console.error('[FHIR] Practitioner lookup failed:', error);
    res.status(500).json({
      resourceType: 'OperationOutcome',
      issue: [{
        severity: 'error',
        code: 'exception',
        details: {
          text: 'Internal server error'
        }
      }]
    });
  }
});