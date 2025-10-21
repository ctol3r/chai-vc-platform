/**
 * Audit logging service for Pilot P0 API
 * Records actions with hash anchoring
 */

import { tryAnchor, generateHash } from './polkadot_service';

/**
 * Record an audit action and return audit reference
 * @param action - The action being performed
 * @param details - Additional details about the action
 * @returns Audit reference string
 */
export async function record(action: string, details: object): Promise<string> {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const auditRef = `${action}-${timestamp}-${randomSuffix}`;
  
  // Create audit data for hashing
  const auditData = {
    action,
    details,
    timestamp,
    auditRef,
  };
  
  // Generate hash for anchoring
  const auditString = JSON.stringify(auditData);
  const hash = generateHash(auditString);
  
  // Log the audit record
  console.log('AUDIT:', {
    auditRef,
    action,
    details,
    hash,
    timestamp: new Date(timestamp).toISOString(),
  });
  
  // Attempt to anchor the hash (non-blocking)
  tryAnchor(hash).catch(error => {
    console.warn('Audit anchoring failed (non-blocking):', error);
  });
  
  return auditRef;
}

/**
 * Record credential issuance
 * @param credentialId - The credential ID
 * @param subjectId - The subject ID
 * @returns Audit reference
 */
export async function recordIssue(credentialId: string, subjectId: string): Promise<string> {
  return record('issue', {
    credentialId,
    subjectId,
  });
}

/**
 * Record credential revocation
 * @param credentialId - The credential ID
 * @returns Audit reference
 */
export async function recordRevoke(credentialId: string): Promise<string> {
  return record('revoke', {
    credentialId,
  });
}

/**
 * Record credential verification
 * @param credentialId - The credential ID
 * @param status - The verification status
 * @returns Audit reference
 */
export async function recordVerify(credentialId: string, status: string): Promise<string> {
  return record('verify', {
    credentialId,
    status,
  });
}

/**
 * Record NPI lookup
 * @param npi - The NPI number
 * @param success - Whether lookup was successful
 * @returns Audit reference
 */
export async function recordNpiLookup(npi: string, success: boolean): Promise<string> {
  return record('npi_lookup', {
    npi,
    success,
  });
}

/**
 * Record FHIR Practitioner lookup
 * @param practitionerId - The practitioner ID
 * @param success - Whether lookup was successful
 * @returns Audit reference
 */
export async function recordFhirLookup(practitionerId: string, success: boolean): Promise<string> {
  return record('fhir_lookup', {
    practitionerId,
    success,
  });
}