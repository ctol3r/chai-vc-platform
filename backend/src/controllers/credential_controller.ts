import { credentialService, Credential } from './credential_service';

/**
 * API-facing controller for credential operations. This file provides helper
 * functions used by routes or GraphQL resolvers.
 */
export function issueProvisionalVC(id: string, data: unknown): Credential {
  return credentialService.createProvisional(id, data);
}

export function finalizeVC(id: string): Credential | undefined {
  return credentialService.markOfficial(id);
}

export function listProvisionalVCs(): Credential[] {
  return credentialService.listProvisional();
}
