import { CredentialState } from '../src/blockchain/credential_status_list';
import { PolkadotService } from '../src/blockchain/polkadot_service';
const assert = require("assert");

const svc = new PolkadotService();

// Register should make credential active
svc.registerCredential('cred1');
assert.strictEqual(svc.getCredentialState('cred1'), CredentialState.ACTIVE);

// Revoking should set status to revoked
svc.registerCredential('cred2');
svc.revokeCredential('cred2');
assert.strictEqual(svc.getCredentialState('cred2'), CredentialState.REVOKED);

// Revoking an unknown credential should throw
let errorCaught = false;
try {
  svc.revokeCredential('unknown');
} catch (err) {
  errorCaught = true;
}
assert.ok(errorCaught, 'Expected error when revoking unknown credential');

console.log('All credential status list tests passed');

