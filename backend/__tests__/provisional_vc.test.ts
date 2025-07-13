import { issueProvisionalVC, finalizeVC, listProvisionalVCs } from '../src/controllers/credential_controller';

// Simple demonstration test for provisional VC lifecycle

describe('provisional VC flow', () => {
  it('marks credentials as provisional then official', () => {
    const vc = issueProvisionalVC('123', { example: true });
    expect(vc.status).toBe('provisional');

    finalizeVC('123');
    const updated = listProvisionalVCs().find(c => c.id === '123');
    expect(updated).toBeUndefined();
  });
});
