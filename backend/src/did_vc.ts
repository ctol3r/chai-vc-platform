import crypto from 'crypto';

export interface VerifiableCredential {
  id: string;
  issuer: string;
  issuanceDate: string;
  credentialSubject: Record<string, any>;
}

export function generateDID(): string {
  const random = crypto.randomBytes(16).toString('hex');
  return `did:example:${random}`;
}

export function issueVC(issuer: string, credentialSubject: Record<string, any>): VerifiableCredential {
  return {
    id: `urn:uuid:${crypto.randomUUID()}`,
    issuer,
    issuanceDate: new Date().toISOString(),
    credentialSubject,
  };
}
