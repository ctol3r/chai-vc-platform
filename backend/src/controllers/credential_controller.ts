import { notifyOnRevocation } from '../notifications/revocation_notifier';

export function revokeCredential(
  credentialId: string,
  clinicianEmails: string[],
  verifierEmails: string[]
): void {
  // Placeholder logic for revocation
  console.log(`Credential ${credentialId} revoked.`);
  notifyOnRevocation(credentialId, clinicianEmails, verifierEmails);
}
