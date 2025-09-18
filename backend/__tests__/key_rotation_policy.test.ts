import { KeyRotationPolicy } from '../src/blockchain/key_rotation_policy';

describe('KeyRotationPolicy', () => {
  it('returns the initial key as active', () => {
    const policy = new KeyRotationPolicy('key1');
    const now = Date.now();
    expect(policy.getActiveKey(now)).toEqual('key1');
  });

  it('rotates to the scheduled key once the window passes', () => {
    const now = Date.now();
    const policy = new KeyRotationPolicy('key1');
    policy.scheduleRotation('key2', now + 1000);

    expect(policy.getActiveKey(now)).toEqual('key1');
    expect(policy.getActiveKey(now + 1500)).toEqual('key2');
  });

  it('clears pending rotation after activation', () => {
    const now = Date.now();
    const policy = new KeyRotationPolicy('key1');
    policy.scheduleRotation('key2', now + 500);

    policy.getActiveKey(now + 600);

    expect(policy.hasPendingRotation()).toBe(false);
    expect(policy.getActiveKey(now + 700)).toEqual('key2');
  });
});
