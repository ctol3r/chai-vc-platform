export function notifyOnRevocation(
  credentialId: string,
  clinicianEmails: string[],
  verifierEmails: string[]
): void {
  const allRecipients = [...clinicianEmails, ...verifierEmails];
  allRecipients.forEach((email) => {
    console.log(`Sending revocation notice for ${credentialId} to ${email}`);
  });
}
