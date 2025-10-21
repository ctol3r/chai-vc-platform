/**
 * FHIR routes for healthcare interoperability
 * Returns FHIR R4 compliant resources
 */

import { Router, Request, Response } from 'express';
import { store } from '../services/store';

const router = Router();

/**
 * GET /fhir/Practitioner/:id
 * Return a FHIR R4 Practitioner resource with qualifications from stored credentials
 */
router.get('/fhir/Practitioner/:id', async (req: Request, res: Response) => {
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
    
    // Find all credentials for this subject
    const credentials = await store.findBySubject(id);
    
    // Build qualifications array from active credentials
    const qualifications = [];
    
    for (const cred of credentials) {
      if (cred.status === 'ACTIVE') {
        // Get full credential data if available
        const credData = await (store as any).getCredential(cred.credentialId);
        
        qualifications.push({
          identifier: [{
            system: 'https://vitalcv.com/credential',
            value: cred.credentialId
          }],
          code: {
            coding: [{
              system: 'http://terminology.hl7.org/CodeSystem/v2-0360',
              code: 'MD',  // Default to MD, would be dynamic in production
              display: 'Doctor of Medicine'
            }],
            text: 'Healthcare Professional License'
          },
          period: credData?.validFrom ? {
            start: credData.validFrom,
            end: credData.validUntil
          } : undefined,
          issuer: {
            display: 'VitalCV Pilot Issuer'
          }
        });
      }
    }
    
    // Build FHIR R4 Practitioner resource
    const practitioner = {
      resourceType: 'Practitioner',
      id: id,
      meta: {
        lastUpdated: new Date().toISOString(),
        profile: [
          'http://hl7.org/fhir/StructureDefinition/Practitioner'
        ]
      },
      identifier: [
        {
          system: 'https://vitalcv.com/practitioner',
          value: id
        }
      ],
      active: qualifications.length > 0,
      qualification: qualifications
    };
    
    // Set proper FHIR content type
    res.setHeader('Content-Type', 'application/fhir+json');
    res.status(200).json(practitioner);
    
  } catch (error) {
    console.error('FHIR Practitioner error:', error);
    res.status(500).json({
      resourceType: 'OperationOutcome',
      issue: [{
        severity: 'error',
        code: 'exception',
        details: {
          text: 'Failed to retrieve Practitioner resource'
        }
      }]
    });
  }
});

/**
 * GET /fhir/metadata
 * Return FHIR CapabilityStatement (optional but good practice)
 */
router.get('/fhir/metadata', (req: Request, res: Response) => {
  const capabilityStatement = {
    resourceType: 'CapabilityStatement',
    status: 'active',
    date: new Date().toISOString(),
    kind: 'instance',
    fhirVersion: '4.0.1',
    format: ['application/fhir+json'],
    implementation: {
      description: 'VitalCV FHIR Bridge - Pilot P0'
    },
    rest: [{
      mode: 'server',
      resource: [{
        type: 'Practitioner',
        interaction: [
          {
            code: 'read'
          }
        ],
        searchParam: []
      }]
    }]
  };
  
  res.setHeader('Content-Type', 'application/fhir+json');
  res.json(capabilityStatement);
});

export default router;