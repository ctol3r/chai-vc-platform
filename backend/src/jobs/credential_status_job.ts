import { PolkadotService } from '../blockchain/polkadot_service';

export interface CredentialRecord {
  id: string;
  status: string;
}

// Simple background job that updates credentials on the blockchain
export async function runCredentialStatusJob(credentials: CredentialRecord[]) {
  const service = new PolkadotService();
  const endpoint = process.env.POLKADOT_ENDPOINT || 'ws://localhost:9944';
  await service.connect(endpoint);

  for (const credential of credentials) {
    await service.updateCredentialStatus(credential.id, credential.status);
  }
}

if (require.main === module) {
  const sampleCredentials: CredentialRecord[] = [
    { id: 'cred-1', status: 'Issued' },
    { id: 'cred-2', status: 'Revoked' },
  ];

  runCredentialStatusJob(sampleCredentials)
    .then(() => {
      console.log('Credential status job completed');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Credential status job failed', err);
      process.exit(1);
    });
}
