import crypto from 'crypto';
import { spawnSync } from 'child_process';
import {
  InMemoryPreAuthorizedCodeStore,
  PreAuthorizedCodeRecord,
  RedisClientLike,
  RedisPreAuthorizedCodeStore,
} from '../src/services/preAuthorizedCodeStore';
import { PreAuthorizedCodeService } from '../src/services/preAuthorizedCodeService';
import { RedisClient } from '../src/services/redis_client';

const GRANT_TYPE = 'urn:ietf:params:oauth:grant-type:pre-authorized_code';

const rc = new RedisClient();

const redisUrl = process.env.REDIS_URL;
let redisAvailable = false;
if (redisUrl) {
  try {
    require.resolve('redis');
    redisAvailable = true;
  } catch {
    const ping = spawnSync('redis-cli', ['-u', redisUrl, 'PING'], { encoding: 'utf8' });
    redisAvailable = ping.status === 0;
  }
}
const describeRedis = redisUrl && redisAvailable ? describe : describe.skip;
const itRedisMock = redisAvailable ? it : it.skip;

beforeAll(async () => {
  process.env.REDIS_URL ??= 'redis://localhost:6379';
  await rc.connect();
});

function challengeFromVerifier(verifier: string): string {
  return crypto.createHash('sha256').update(verifier).digest('base64url');
}

describe('PreAuthorizedCodeService', () => {
  let warnSpy: jest.SpyInstance;

  beforeEach(() => {
    process.env.LOG_LEVEL = 'error';
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.useRealTimers();
    warnSpy.mockRestore();
    delete process.env.LOG_LEVEL;
  });

  it('requires a code challenge when issuing', async () => {
    const service = new PreAuthorizedCodeService();
    await expect(
      service.issue({
        clientId: 'wallet',
        walletNonce: 'nonce',
        codeChallenge: '',
      })
    ).rejects.toThrow('code_challenge_required');
  });

  it('rejects unsupported PKCE methods', async () => {
    const service = new PreAuthorizedCodeService();
    await expect(
      service.issue({
        clientId: 'wallet',
        walletNonce: 'nonce',
        codeChallenge: 'ignored',
        codeChallengeMethod: 'plain',
      })
    ).rejects.toThrow('unsupported_code_challenge_method');
  });

  it('rejects redemption when c_nonce expired', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2024-01-01T00:00:00Z'));
    const service = new PreAuthorizedCodeService({ requireTxCode: false, nonceTtlSeconds: 1 });
    const verifier = 'expired-nonce';
    const { preAuthorizedCode } = await service.issue({
      clientId: 'wallet',
      walletNonce: 'nonce',
      codeChallenge: challengeFromVerifier(verifier),
      cNonceExpiresIn: 1,
    });
    jest.advanceTimersByTime(1500);
    jest.setSystemTime(new Date('2024-01-01T00:00:01.500Z'));
    jest.runOnlyPendingTimers();

    await expect(
      service.redeem(preAuthorizedCode, 'nonce', verifier, GRANT_TYPE)
    ).rejects.toThrow('replay_detected');
  });

  it('detects nonce replay attempts', async () => {
    const service = new PreAuthorizedCodeService();
    const verifier = 'nonce-replay';
    const { preAuthorizedCode, cNonce } = await service.issue({
      clientId: 'wallet',
      walletNonce: 'nonce',
      codeChallenge: challengeFromVerifier(verifier),
    });

    await (service as any).store.consumeNonce(cNonce);

    await expect(
      service.redeem(preAuthorizedCode, 'nonce', verifier, GRANT_TYPE)
    ).rejects.toThrow('replay_detected');
  });

  it('rejects PKCE verifier mismatches', async () => {
    const service = new PreAuthorizedCodeService();
    const { preAuthorizedCode } = await service.issue({
      clientId: 'wallet',
      walletNonce: 'nonce',
      codeChallenge: challengeFromVerifier('correct-verifier'),
    });

    await expect(
      service.redeem(preAuthorizedCode, 'nonce', 'wrong-verifier', GRANT_TYPE)
    ).rejects.toThrow('invalid_code_verifier');
  });

  it('enforces supported grant type', async () => {
    const service = new PreAuthorizedCodeService();
    const { preAuthorizedCode } = await service.issue({
      clientId: 'wallet',
      walletNonce: 'nonce',
      codeChallenge: challengeFromVerifier('verifier'),
    });

    await expect(service.redeem(preAuthorizedCode, 'nonce', 'verifier', 'authorization_code')).rejects.toThrow(
      'unsupported_grant_type'
    );
  });

  it('requires a code verifier', async () => {
    const service = new PreAuthorizedCodeService();
    const { preAuthorizedCode } = await service.issue({
      clientId: 'wallet',
      walletNonce: 'nonce',
      codeChallenge: challengeFromVerifier('verifier'),
    });

    await expect(service.redeem(preAuthorizedCode, 'nonce', '', GRANT_TYPE)).rejects.toThrow('missing_code_verifier');
  });

  it('requires tx_code when configured', async () => {
    const service = new PreAuthorizedCodeService({ requireTxCode: true });
    const verifier = 'tx-code-flow';
    const { preAuthorizedCode, txCode } = await service.issue({
      clientId: 'wallet',
      walletNonce: 'nonce',
      codeChallenge: challengeFromVerifier(verifier),
    });
    expect(txCode).toHaveLength(service.getTxCodeLength());

    await expect(
      service.redeem(preAuthorizedCode, 'nonce', verifier, GRANT_TYPE)
    ).rejects.toThrow('missing_tx_code');

    await expect(
      service.redeem(preAuthorizedCode, 'nonce', verifier, GRANT_TYPE, '000000')
    ).rejects.toThrow('invalid_tx_code');

    const redemption = await service.redeem(preAuthorizedCode, 'nonce', verifier, GRANT_TYPE, txCode);
    expect(typeof redemption.accessToken).toBe('string');
  });

  it('rejects expired tx_code values', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2024-01-01T00:00:00Z'));
    const service = new PreAuthorizedCodeService({ requireTxCode: true, txCodeTtlSeconds: 1 });
    const verifier = 'tx-code-expiry';
    const { preAuthorizedCode, txCode } = await service.issue({
      clientId: 'wallet',
      walletNonce: 'nonce',
      codeChallenge: challengeFromVerifier(verifier),
    });
    jest.advanceTimersByTime(2000);
    jest.setSystemTime(new Date('2024-01-01T00:00:02Z'));
    jest.runOnlyPendingTimers();
    await expect(
      service.redeem(preAuthorizedCode, 'nonce', verifier, GRANT_TYPE, txCode)
    ).rejects.toThrow('tx_code_expired');
  });

  it('rejects when tx_code hash is missing in storage', async () => {
    const service = new PreAuthorizedCodeService({ requireTxCode: true });
    const verifier = 'missing-hash';
    const { preAuthorizedCode, txCode } = await service.issue({
      clientId: 'wallet',
      walletNonce: 'nonce',
      codeChallenge: challengeFromVerifier(verifier),
    });
    const store = (service as any).store as InMemoryPreAuthorizedCodeStore;
    const stored = (await store.getCode(preAuthorizedCode)) as PreAuthorizedCodeRecord;
    await store.saveCode({ ...stored, txCodeHash: undefined }, 600);

    await expect(
      service.redeem(preAuthorizedCode, 'nonce', verifier, GRANT_TYPE, txCode)
    ).rejects.toThrow('invalid_tx_code');
  });

  it('rejects when stored challenge method is unsupported', async () => {
    const service = new PreAuthorizedCodeService();
    const verifier = 'bad-method';
    const { preAuthorizedCode } = await service.issue({
      clientId: 'wallet',
      walletNonce: 'nonce',
      codeChallenge: challengeFromVerifier(verifier),
    });
    const store = (service as any).store as InMemoryPreAuthorizedCodeStore;
    const stored = (await store.getCode(preAuthorizedCode)) as PreAuthorizedCodeRecord;
    await store.saveCode({ ...stored, codeChallengeMethod: 'plain' as any }, 600);

    await expect(
      service.redeem(preAuthorizedCode, 'nonce', verifier, GRANT_TYPE)
    ).rejects.toThrow('invalid_code_verifier');
  });

  it('rejects unknown or reused pre-authorized codes', async () => {
    const service = new PreAuthorizedCodeService();
    await expect(
      service.redeem('missing', 'nonce', 'verifier', GRANT_TYPE)
    ).rejects.toThrow('invalid_pre_authorized_code');

    const verifier = 'reuse-verifier';
    const { preAuthorizedCode } = await service.issue({
      clientId: 'wallet',
      walletNonce: 'nonce',
      codeChallenge: challengeFromVerifier(verifier),
    });
    await service.redeem(preAuthorizedCode, 'nonce', verifier, GRANT_TYPE);
    await expect(
      service.redeem(preAuthorizedCode, 'nonce', verifier, GRANT_TYPE)
    ).rejects.toThrow('pre_authorized_code_already_used');
  });

  it('expires pre-authorized codes after ttl', async () => {
    const service = new PreAuthorizedCodeService();
    const verifier = 'expiry-verifier';
    const { preAuthorizedCode } = await service.issue({
      clientId: 'wallet',
      walletNonce: 'nonce',
      codeChallenge: challengeFromVerifier(verifier),
    });
    const store = (service as any).store as InMemoryPreAuthorizedCodeStore;
    const stored = (await store.getCode(preAuthorizedCode)) as PreAuthorizedCodeRecord;
    await store.saveCode({ ...stored, expiresAt: Date.now() - 1000 }, 600);

    await expect(
      service.redeem(preAuthorizedCode, 'nonce', verifier, GRANT_TYPE)
    ).rejects.toThrow('pre_authorized_code_expired');
  });

  it('generates tx codes when not provided', async () => {
    const service = new PreAuthorizedCodeService({ requireTxCode: true, txCodeLength: 8 });
    const response = await service.issue({
      clientId: 'wallet',
      walletNonce: 'nonce',
      codeChallenge: challengeFromVerifier('auto-tx'),
    });
    expect(response.txCodeRequired).toBe(true);
    expect(response.txCode).toMatch(/^\d{8}$/);
  });

  it('allows swapping the backing store', async () => {
    const service = new PreAuthorizedCodeService();
    service.useStore(new InMemoryPreAuthorizedCodeStore());
    const verifier = 'swap-store';
    const { preAuthorizedCode } = await service.issue({
      clientId: 'wallet',
      walletNonce: 'nonce',
      codeChallenge: challengeFromVerifier(verifier),
    });
    const redemption = await service.redeem(preAuthorizedCode, 'nonce', verifier, GRANT_TYPE);
    expect(typeof redemption.accessToken).toBe('string');
  });

  it('falls back to memory store when redis-cli ping fails', async () => {
    const originalStore = process.env.OIDC_PRE_AUTH_STORE;
    const originalRedisUrl = process.env.REDIS_URL;
    process.env.OIDC_PRE_AUTH_STORE = 'redis';
    process.env.REDIS_URL = 'redis://example.com';
    try {
      jest.isolateModules(() => {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { PreAuthorizedCodeService: IsolatedService } = require('../src/services/preAuthorizedCodeService');
        const service = new IsolatedService();
        expect(service.isRedisBacked()).toBe(false);
      });
    } finally {
      jest.resetModules();
      process.env.OIDC_PRE_AUTH_STORE = originalStore;
      process.env.REDIS_URL = originalRedisUrl;
    }
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('falls back to memory store when redis url is missing', () => {
    const originalStore = process.env.OIDC_PRE_AUTH_STORE;
    const originalRedisUrl = process.env.REDIS_URL;
    process.env.OIDC_PRE_AUTH_STORE = 'redis';
    delete process.env.REDIS_URL;
    try {
      jest.isolateModules(() => {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { PreAuthorizedCodeService: IsolatedService } = require('../src/services/preAuthorizedCodeService');
        const service = new IsolatedService();
        expect(service.isRedisBacked()).toBe(false);
      });
    } finally {
      jest.resetModules();
      process.env.OIDC_PRE_AUTH_STORE = originalStore;
      process.env.REDIS_URL = originalRedisUrl;
    }
    expect(warnSpy).not.toHaveBeenCalled();
  });

  itRedisMock('initialises redis store when client implementation is provided', () => {
    const originalStore = process.env.OIDC_PRE_AUTH_STORE;
    const originalRedisUrl = process.env.REDIS_URL;
    process.env.OIDC_PRE_AUTH_STORE = 'redis';
    process.env.REDIS_URL = 'redis://example.com';
    try {
      jest.isolateModules(() => {
        jest.doMock('redis', () => ({
          createClient: () => ({
            isOpen: false,
            connect: jest.fn().mockResolvedValue(undefined),
            on: jest.fn(),
          }),
        }));
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { PreAuthorizedCodeService: RedisEnabledService } = require('../src/services/preAuthorizedCodeService');
        const service = new RedisEnabledService();
        expect(service.isRedisBacked()).toBe(true);
      });
    } finally {
      jest.resetModules();
      process.env.OIDC_PRE_AUTH_STORE = originalStore;
      process.env.REDIS_URL = originalRedisUrl;
    }
  });

  it('clamps nonce TTL when issuing ad-hoc nonces', async () => {
    const service = new PreAuthorizedCodeService();
    const { cNonceExpiresIn } = await service.issueNonce(10);
    expect(cNonceExpiresIn).toBe(60);
  });

  it('maps redeem outcome statuses to domain errors', () => {
    const service = new PreAuthorizedCodeService();
    const assertOutcome = (service as any).assertRedeemOutcome.bind(service);
    expect(() => assertOutcome({ status: 'ok' })).not.toThrow();
    expect(() => assertOutcome({ status: 'used' })).toThrow('pre_authorized_code_already_used');
    expect(() => assertOutcome({ status: 'expired' })).toThrow('pre_authorized_code_expired');
    expect(() => assertOutcome({ status: 'wallet_mismatch' })).toThrow('nonce_mismatch');
    expect(() => assertOutcome({ status: 'missing' })).toThrow('invalid_pre_authorized_code');
  });

  it('throws when redis health is requested without configuration', async () => {
    const service = new PreAuthorizedCodeService();
    await expect(service.checkRedisHealth()).rejects.toThrow('redis_not_configured');
  });

  it('reports redis health when a compatible store is injected', async () => {
    class StubRedisStore extends InMemoryPreAuthorizedCodeStore {
      kind(): 'memory' | 'redis' {
        return 'redis';
      }

      ping(): Promise<string> {
        return Promise.resolve('PONG');
      }
    }
    const service = new PreAuthorizedCodeService();
    service.useStore(new StubRedisStore());
    await expect(service.checkRedisHealth()).resolves.toBe(true);
  });

  it('surfaces redis health failures when ping returns unexpected value', async () => {
    class FailingRedisStore extends InMemoryPreAuthorizedCodeStore {
      kind(): 'memory' | 'redis' {
        return 'redis';
      }

      ping(): Promise<string> {
        return Promise.resolve('ERR');
      }
    }
    const service = new PreAuthorizedCodeService();
    service.useStore(new FailingRedisStore());
    await expect(service.checkRedisHealth()).rejects.toThrow('redis_unhealthy');
  });

  it('emits warning once when redis permission denied', () => {
    const originalStore = process.env.OIDC_PRE_AUTH_STORE;
    const originalRedisUrl = process.env.REDIS_URL;
    process.env.OIDC_PRE_AUTH_STORE = 'redis';
    process.env.REDIS_URL = 'redis://perms-denied';
    try {
      let emitted = false;
      jest.isolateModules(() => {
        jest.doMock('../src/services/redisClientFactory', () => {
          return {
            probeRedis: jest.fn(() => ({ ok: false, mode: 'redis-cli', error: 'EPERM', permissionDenied: true })),
            probe: jest.fn(() => ({ ok: false, mode: 'redis-cli', error: 'EPERM', permissionDenied: true })),
            createRedisClient: jest.fn(() => undefined),
            redisLog: (level: string, message: string, meta?: Record<string, unknown>) => {
              if (level === 'warn' && !emitted) {
                emitted = true;
                console.warn(`${message} ${meta ? JSON.stringify(meta) : ''}`.trim());
              }
            },
          };
        });
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { PreAuthorizedCodeService: IsolatedService } = require('../src/services/preAuthorizedCodeService');
        const service = new IsolatedService();
        expect(service.isRedisBacked()).toBe(false);
      });
      expect(warnSpy).toHaveBeenCalledTimes(1);
      expect(warnSpy.mock.calls[0][0]).toContain('Redis access denied');
    } finally {
      process.env.OIDC_PRE_AUTH_STORE = originalStore;
      process.env.REDIS_URL = originalRedisUrl;
      jest.resetModules();
    }
  });
});

class FakeRedisClient implements RedisClientLike {
  private store = new Map<string, string>();

  async get(key: string): Promise<string | null> {
    return this.store.has(key) ? this.store.get(key)! : null;
  }

  async set(key: string, value: string, options: { PX: number; NX?: boolean }): Promise<string | null> {
    if (options.NX && this.store.has(key)) {
      return null;
    }
    this.store.set(key, value);
    return 'OK';
  }

  async del(key: string | string[]): Promise<number> {
    const keys = Array.isArray(key) ? key : [key];
    let removed = 0;
    for (const k of keys) {
      if (this.store.delete(k)) {
        removed += 1;
      }
    }
    return removed;
  }

  async eval<T = unknown>(script: string, options: { keys?: string[]; arguments?: (string | number)[] }): Promise<T> {
    const [key] = options.keys ?? [];
    if (!key) {
      return JSON.stringify({ status: 'missing' }) as unknown as T;
    }
    if (key.includes(':nonce:')) {
      if (!this.store.has(key)) {
        return 0 as unknown as T;
      }
      this.store.delete(key);
      return 1 as unknown as T;
    }
    const walletNonce = String(options.arguments?.[0] ?? '');
    const now = Number(options.arguments?.[1] ?? Date.now());
    const usedTtlMs = Number(options.arguments?.[2] ?? 0);
    const newNonce = String(options.arguments?.[3] ?? '');
    const newNonceExpiry = Number(options.arguments?.[4] ?? now);
    const value = this.store.get(key);
    if (!value) {
      return JSON.stringify({ status: 'missing' }) as unknown as T;
    }
    const data = JSON.parse(value) as PreAuthorizedCodeRecord;
    if (data.expiresAt < now) {
      this.store.delete(key);
      return JSON.stringify({ status: 'expired' }) as unknown as T;
    }
    if (data.used) {
      return JSON.stringify({ status: 'used', record: data }) as unknown as T;
    }
    if (data.walletNonce !== walletNonce) {
      return JSON.stringify({ status: 'wallet_mismatch' }) as unknown as T;
    }
    data.used = true;
    data.lastRedemptionAt = now;
    data.cNonce = newNonce;
    data.cNonceExpiresAt = newNonceExpiry;
    data.expiresAt = now + usedTtlMs;
    this.store.set(key, JSON.stringify(data));
    return JSON.stringify({ status: 'ok', record: data }) as unknown as T;
  }

  async *scanIterator(options: { MATCH: string; COUNT?: number }): AsyncIterable<string> {
    const prefix = options.MATCH.replace('*', '');
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) {
        yield key;
      }
    }
  }

  ping(): Promise<string> {
    return Promise.resolve('PONG');
  }
}

describe('RedisPreAuthorizedCodeStore (mock client)', () => {
  it('handles code lifecycle with atomic redeem semantics', async () => {
    const client = new FakeRedisClient();
    const store = new RedisPreAuthorizedCodeStore(client);
    const record: PreAuthorizedCodeRecord = {
      code: 'code-mock',
      clientId: 'wallet',
      walletNonce: 'nonce',
      codeChallenge: 'challenge',
      codeChallengeMethod: 'S256',
      cNonce: 'nonce-1',
      cNonceExpiresAt: Date.now() + 90_000,
      expiresAt: Date.now() + 600_000,
      used: false,
      txCodeRequired: false,
    };
    await store.saveCode(record, 600);
    expect((await store.getCode(record.code))?.code).toBe(record.code);

    await store.saveNonce('nonce-1', 90);
    expect(await store.consumeNonce('nonce-1')).toBe(true);
    expect(await store.consumeNonce('nonce-1')).toBe(false);

    const mismatch = await store.markCodeRedeemed(record.code, {
      walletNonce: 'other',
      cNonce: 'nonce-2',
      cNonceExpiresAt: Date.now() + 90_000,
      lastRedemptionAt: Date.now(),
      usedTtlSeconds: 300,
    });
    expect(mismatch.status).toBe('wallet_mismatch');

    const outcome = await store.markCodeRedeemed(record.code, {
      walletNonce: 'nonce',
      cNonce: 'nonce-3',
      cNonceExpiresAt: Date.now() + 90_000,
      lastRedemptionAt: Date.now(),
      usedTtlSeconds: 300,
    });
    expect(outcome.status).toBe('ok');

    const second = await store.markCodeRedeemed(record.code, {
      walletNonce: 'nonce',
      cNonce: 'nonce-4',
      cNonceExpiresAt: Date.now() + 90_000,
      lastRedemptionAt: Date.now(),
      usedTtlSeconds: 300,
    });
    expect(second.status).toBe('used');

    await store.clear();
    expect(await store.getCode(record.code)).toBeUndefined();
  });
});

describeRedis('RedisPreAuthorizedCodeStore integration', () => {
  let client: any;
  let store: RedisPreAuthorizedCodeStore;

  beforeAll(async () => {
    const mod = require('redis');
    client = mod.createClient({ url: redisUrl });
    await client.connect();
    store = new RedisPreAuthorizedCodeStore(client);
    await store.clear();
  });

  afterAll(async () => {
    if (client && typeof client.quit === 'function') {
      await client.quit();
    }
  });

  it('saves and redeems codes atomically', async () => {
    const record: PreAuthorizedCodeRecord = {
      code: 'code-123',
      clientId: 'wallet',
      walletNonce: 'nonce',
      codeChallenge: 'challenge',
      codeChallengeMethod: 'S256',
      cNonce: 'nonce-1',
      cNonceExpiresAt: Date.now() + 90_000,
      expiresAt: Date.now() + 600_000,
      used: false,
      txCodeRequired: false,
    };
    await store.saveCode(record, 600);
    const fetched = await store.getCode(record.code);
    expect(fetched?.code).toBe(record.code);

    const outcome = await store.markCodeRedeemed(record.code, {
      walletNonce: 'nonce',
      cNonce: 'nonce-2',
      cNonceExpiresAt: Date.now() + 90_000,
      lastRedemptionAt: Date.now(),
      usedTtlSeconds: 300,
    });
    expect(outcome.status).toBe('ok');

    const second = await store.markCodeRedeemed(record.code, {
      walletNonce: 'nonce',
      cNonce: 'nonce-3',
      cNonceExpiresAt: Date.now() + 90_000,
      lastRedemptionAt: Date.now(),
      usedTtlSeconds: 300,
    });
    expect(second.status).toBe('used');
  });
});
