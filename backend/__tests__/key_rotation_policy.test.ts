import { KeyRotationPolicy } from '../src/blockchain/key_rotation_policy';

describe('KeyRotationPolicy', () => {
  test('issues a key and returns it as active', () => {
    const policy = new KeyRotationPolicy('key1');
    const key = policy.getActiveKey(Date.now());
    expect(key).toEqual('key1');
  });

  test('rotates to a new active key after scheduled window', () => {
    const now = Date.now();
    const policy = new KeyRotationPolicy('key1');
    policy.scheduleRotation('key2', now + 1000);

    expect(policy.getActiveKey(now)).toEqual('key1');
    expect(policy.getActiveKey(now + 1500)).toEqual('key2');
  });
});
