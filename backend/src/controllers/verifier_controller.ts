import { checkCredentialStatus } from '../blockchain/blockchain_integration';

export async function getCredentialStatus(credentialId: string): Promise<'valid'|'revoked'|'unknown'> {
  const id = typeof credentialId === 'string' ? credentialId : String(credentialId ?? '');
  return await checkCredentialStatus(id);
}
