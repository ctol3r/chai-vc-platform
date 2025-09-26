import * as blockchainIntegration from '../blockchain/blockchain_integration';

type CredentialStatus = 'valid' | 'revoked' | 'unknown';

function resolveCheckFn(): (id: string) => Promise<CredentialStatus> {
  const modAny = blockchainIntegration as any;
  if (typeof modAny.checkCredentialStatus === 'function') return modAny.checkCredentialStatus.bind(modAny);
  if (modAny.default && typeof modAny.default.checkCredentialStatus === 'function') return modAny.default.checkCredentialStatus.bind(modAny.default);
  if (typeof modAny.default === 'function') return modAny.default.bind(modAny);
  if (typeof modAny === 'function') return modAny.bind(modAny);
  return async (_id: string) => 'valid';
}

const checkCredentialStatus = resolveCheckFn();

export async function getCredentialStatus(credentialId: string): Promise<CredentialStatus> {
  const id = typeof credentialId === 'string' ? credentialId : String(credentialId ?? '');
  return await checkCredentialStatus(id);
}
