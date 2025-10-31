/**
 * SD-JWT / SD-VC placeholder generator for pilot
 * 
 * This is a contract-level stub that returns placeholder SD-JWT structures.
 * In production, this would be replaced with actual SD-JWT/BBS+ implementation.
 * 
 * Reference: https://datatracker.ietf.org/doc/draft-ietf-oauth-selective-disclosure-jwt/
 */

export interface SDJWTDisclosure {
  id: string;
  revealed: string[]; // Array of claim keys that are revealed
  concealed: string[]; // Array of claim keys that are concealed (selectively disclosed)
}

export interface SDJWTResult {
  sdJwt: string; // The SD-JWT string (placeholder in pilot)
  disclosures: SDJWTDisclosure;
  alg: string; // Algorithm identifier (pilot uses 'pilot-none')
  issuedAt: string; // ISO timestamp
}

/**
 * Generate a placeholder SD-JWT structure for a VC
 * 
 * @param vc - Verifiable Credential object
 * @returns SD-JWT placeholder structure
 */
export function makeSdJwtPlaceholder(vc: any): SDJWTResult {
  // Extract claim keys from VC (exclude metadata fields)
  const excludedKeys = ['id', 'type', 'issuedBy', 'issuedAt', '@context', 'proof'];
  const allKeys = Object.keys(vc.credentialSubject || vc).filter(
    (key) => !excludedKeys.includes(key)
  );

  // Default revealed fields for pilot demo
  const defaultRevealed = ['name', 'licenseNumber'];
  const revealed = allKeys.filter((key) => defaultRevealed.includes(key));
  const concealed = allKeys.filter((key) => !defaultRevealed.includes(key));

  const disclosure: SDJWTDisclosure = {
    id: vc.id || 'vc-pilot',
    revealed,
    concealed,
  };

  // Generate placeholder SD-JWT string
  // Format: header.payload.disclosures.signature (simplified for pilot)
  const header = Buffer.from(JSON.stringify({ alg: 'pilot-none', typ: 'sd-jwt' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    vc_id: vc.id || 'vc-pilot',
    type: vc.type || 'MedicalLicenseVC',
    issued_at: new Date().toISOString(),
  })).toString('base64url');
  const sdJwt = `${header}.${payload}.pilot-signature-${Date.now()}`;

  return {
    sdJwt,
    disclosures: disclosure,
    alg: 'pilot-none',
    issuedAt: new Date().toISOString(),
  };
}

/**
 * Generate selective disclosure for specific attributes
 * 
 * @param vc - Verifiable Credential object
 * @param requestedAttributes - Array of attribute keys to reveal
 * @returns SD-JWT with custom disclosure set
 */
export function makeSelectiveDisclosure(vc: any, requestedAttributes: string[]): SDJWTResult {
  const allKeys = Object.keys(vc.credentialSubject || vc).filter(
    (key) => !['id', 'type', 'issuedBy', 'issuedAt', '@context', 'proof'].includes(key)
  );

  const revealed = requestedAttributes.filter((key) => allKeys.includes(key));
  const concealed = allKeys.filter((key) => !requestedAttributes.includes(key));

  const disclosure: SDJWTDisclosure = {
    id: vc.id || 'vc-pilot',
    revealed,
    concealed,
  };

  const header = Buffer.from(JSON.stringify({ alg: 'pilot-none', typ: 'sd-jwt' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    vc_id: vc.id || 'vc-pilot',
    type: vc.type || 'MedicalLicenseVC',
    revealed_claims: revealed,
    issued_at: new Date().toISOString(),
  })).toString('base64url');
  const sdJwt = `${header}.${payload}.pilot-signature-${Date.now()}`;

  return {
    sdJwt,
    disclosures: disclosure,
    alg: 'pilot-none',
    issuedAt: new Date().toISOString(),
  };
}
