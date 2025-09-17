import { KeyRotationPolicy } from '../src/crypto/key_rotation_policy';

describe('KeyRotationPolicy', () => {
  it('returns active key before and after rotation window', () => {
    const policy = new KeyRotationPolicy();
    const key1 = policy.issueKey();
    expect(policy.getActiveKey()).toEqual(key1);

    policy.rotateKeys();
    const key2 = policy.getActiveKey();
    expect(key2).not.toEqual(key1);
  });
});
