import crypto from 'crypto';
import { store } from '../services/credential_store';
import { tryAnchor } from '../services/polkadot_service';

interface IssueCredentialRequest {
  credentialSubject: any;
  issuer: string;
}

interface IssueCredentialResponse {
  credentialId: string;
  jwt: string;
  auditRef?: string;
}

export async function issueCredential(payload: IssueCredentialRequest): Promise<IssueCredentialResponse> {
  const credentialId = `cred-${crypto.randomBytes(16).toString('hex')}`;
  
  const credential = {
    '@context': ['https://www.w3.org/2018/credentials/v1'],
    type: ['VerifiableCredential'],
    id: credentialId,
    issuer: payload.issuer,
    issuanceDate: new Date().toISOString(),
    credentialSubject: payload.credentialSubject,
  };

  const jwt = Buffer.from(JSON.stringify(credential)).toString('base64url');
  const hash = crypto.createHash('sha256').update(jwt).digest('hex');

  await store.store(credentialId, jwt, credential);
  await tryAnchor(hash);

  return {
    credentialId,
    jwt,
    auditRef: hash.slice(0, 16),
  };
}
