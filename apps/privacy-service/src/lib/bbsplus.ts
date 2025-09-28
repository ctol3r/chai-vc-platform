import { createHash } from 'crypto';

export interface IssueRequest {
  subjectId: string;
  claims: Record<string, unknown>;
  audience?: string;
  nonce?: string;
}

export interface IssuedCredential {
  credentialId: string;
  subjectId: string;
  claims: Record<string, unknown>;
  audience?: string;
  nonce: string;
  signature: string;
  issuedAt: string;
}

export interface DisclosureRequest {
  credential: IssuedCredential;
  revealFields?: string[];
}

export interface DisclosureProof {
  proofId: string;
  credentialId: string;
  signature: string;
  nonce: string;
  disclosureSignature: string;
  disclosureType: 'full' | 'selective';
  revealedFields: string[];
  revealedClaims: Record<string, unknown>;
  createdAt: string;
}

export interface VerificationReport {
  valid: boolean;
  reason?: string;
  details: {
    credentialId: string;
    signatureValid: boolean;
    disclosureValid: boolean;
    disclosureType: 'full' | 'selective';
    revealedFields: string[];
  };
}

const sortObject = (claims: Record<string, unknown>): Record<string, unknown> => {
  return Object.keys(claims)
    .sort()
    .reduce<Record<string, unknown>>((acc, key) => {
      acc[key] = claims[key];
      return acc;
    }, {});
};

const canonicalJson = (claims: Record<string, unknown>): string => {
  return JSON.stringify(sortObject(claims));
};

const createSignature = (
  subjectId: string,
  claims: Record<string, unknown>,
  nonce: string,
  audience: string
): string => {
  const payload = `${subjectId}|${audience}|${canonicalJson(claims)}|${nonce}`;
  return createHash('sha256').update(payload).digest('hex');
};

const createDisclosureSignature = (
  signature: string,
  nonce: string,
  revealedClaims: Record<string, unknown>
): string => {
  const payload = `${signature}|${nonce}|${canonicalJson(revealedClaims)}`;
  return createHash('sha256').update(payload).digest('hex');
};

export function issueCredential(request: IssueRequest): IssuedCredential {
  if (!request.subjectId || request.subjectId.trim().length === 0) {
    throw new Error('subjectId is required');
  }

  const nonce = request.nonce ?? createHash('sha256').update(Date.now().toString()).digest('hex').slice(0, 16);
  const audience = request.audience ?? 'public';
  const signature = createSignature(request.subjectId, request.claims, nonce, audience);

  return {
    credentialId: `cred-${signature.slice(0, 12)}`,
    subjectId: request.subjectId,
    claims: request.claims,
    audience,
    nonce,
    signature,
    issuedAt: new Date().toISOString(),
  };
}

export function verifyCredential(credential: IssuedCredential): boolean {
  const expected = createSignature(
    credential.subjectId,
    credential.claims,
    credential.nonce,
    credential.audience ?? 'public'
  );

  return expected === credential.signature;
}

export function createDisclosureProof(request: DisclosureRequest): DisclosureProof {
  const { credential } = request;
  const revealFields = request.revealFields ?? Object.keys(credential.claims);
  const uniqueFields = Array.from(new Set(revealFields)).filter((key) => key in credential.claims);
  const sortedFields = uniqueFields.sort();

  const revealedClaims = sortedFields.reduce<Record<string, unknown>>((acc, key) => {
    acc[key] = credential.claims[key];
    return acc;
  }, {});

  const disclosureSignature = createDisclosureSignature(
    credential.signature,
    credential.nonce,
    revealedClaims
  );

  const disclosureType = sortedFields.length === Object.keys(credential.claims).length ? 'full' : 'selective';

  return {
    proofId: `proof-${disclosureSignature.slice(0, 12)}`,
    credentialId: credential.credentialId,
    signature: credential.signature,
    nonce: credential.nonce,
    disclosureSignature,
    disclosureType,
    revealedFields: sortedFields,
    revealedClaims,
    createdAt: new Date().toISOString(),
  };
}

export function verifyDisclosureProof(proof: DisclosureProof, credential: IssuedCredential): VerificationReport {
  const signatureValid = verifyCredential(credential) && credential.signature === proof.signature;
  const expectedDisclosure = createDisclosureSignature(credential.signature, credential.nonce, proof.revealedClaims);
  const disclosureValid = proof.disclosureSignature === expectedDisclosure;

  const valid = signatureValid && disclosureValid;

  return {
    valid,
    reason: valid ? undefined : 'invalid-proof',
    details: {
      credentialId: credential.credentialId,
      signatureValid,
      disclosureValid,
      disclosureType: proof.disclosureType,
      revealedFields: proof.revealedFields,
    },
  };
}
