import { CredentialReuseController, CredentialReuseRequest } from './credential_reuse_flow';

// Simple wrapper around credential reuse controller used by the API layer.
export function initiateReuse(req: CredentialReuseRequest): string {
  return CredentialReuseController.generateReuseLink(req);
}
