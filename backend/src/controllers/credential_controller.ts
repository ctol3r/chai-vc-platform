export interface Credential {
  id: string;
  data?: string;
  status: string;
}

let credentials: Record<string, Credential> = {};
let nextId = 1;

export function requestCredential(data: string): Credential {
  const id = String(nextId++);
  const credential: Credential = { id, data, status: 'requested' };
  credentials[id] = credential;
  return credential;
}

export function verifyCredential(id: string): Credential {
  const credential = credentials[id];
  if (!credential) {
    throw new Error('Credential not found');
  }
  credential.status = 'verified';
  return credential;
}

export function revokeCredential(id: string): Credential {
  const credential = credentials[id];
  if (!credential) {
    throw new Error('Credential not found');
  }
  credential.status = 'revoked';
  return credential;
}
