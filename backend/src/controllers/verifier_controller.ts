import { store } from '../services/credential_store';

export enum CredentialStatus {
  ACTIVE = 'ACTIVE',
  REVOKED = 'REVOKED',
  EXPIRED = 'EXPIRED',
  SUSPENDED = 'SUSPENDED'
}

export async function getCredentialStatus(credentialId: string): Promise<CredentialStatus> {
  const status = await store.getStatus(credentialId);
  
  if (!status) return CredentialStatus.ACTIVE;
  
  const statusMap: Record<string, CredentialStatus> = {
    'active': CredentialStatus.ACTIVE,
    'revoked': CredentialStatus.REVOKED,
    'expired': CredentialStatus.EXPIRED,
    'suspended': CredentialStatus.SUSPENDED,
  };
  
  return statusMap[status] || CredentialStatus.ACTIVE;
}

export async function verifyPresentation(jwt: string): Promise<{
  valid: boolean;
  reason?: string;
  auditRef?: string;
  credentialSubject?: any;
}> {
  try {
    const decoded = Buffer.from(jwt, 'base64url').toString('utf-8');
    const credential = JSON.parse(decoded);

    const status = await getCredentialStatus(credential.id);
    console.log(`Credential ${credential.id} status: ${status}`);
    
    if (status === CredentialStatus.REVOKED) {
      return {
        valid: false,
        reason: 'credential_revoked',
        auditRef: credential.id.slice(0, 16),
      };
    }

    if (status === CredentialStatus.EXPIRED) {
      return {
        valid: false,
        reason: 'credential_expired',
        auditRef: credential.id.slice(0, 16),
      };
    }

    return {
      valid: true,
      auditRef: credential.id.slice(0, 16),
      credentialSubject: credential.credentialSubject,
    };
  } catch (error) {
    console.error('Verify error:', error);
    return {
      valid: false,
      reason: 'invalid_jwt_format',
    };
  }
}
