import { issueCredential, createDisclosureProof, type IssuedCredential, type DisclosureProof } from './bbsplus';

export interface ProveRequest {
  subjectId: string;
  claims: Record<string, unknown>;
  audience?: string;
  revealFields?: string[];
}

export interface ProofRecord {
  proofId: string;
  issuedAt: string;
  credential: IssuedCredential;
  proof: DisclosureProof;
}

export function generateProof(request: ProveRequest): ProofRecord {
  if (!request.subjectId || request.subjectId.trim().length === 0) {
    throw new Error('subjectId is required');
  }
  if (!request.claims || typeof request.claims !== 'object') {
    throw new Error('claims are required');
  }

  const credential = issueCredential({
    subjectId: request.subjectId,
    claims: request.claims,
    audience: request.audience,
  });

  const proof = createDisclosureProof({
    credential,
    revealFields: request.revealFields,
  });

  return {
    proofId: proof.proofId,
    issuedAt: credential.issuedAt,
    credential,
    proof,
  };
}
