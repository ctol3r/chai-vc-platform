import { verifyCredential } from '../src/controllers/credential_controller';

test('verifyCredential anchors rationale', async () => {
  await expect(verifyCredential('1', 'rationale')).resolves.toBeUndefined();
});
