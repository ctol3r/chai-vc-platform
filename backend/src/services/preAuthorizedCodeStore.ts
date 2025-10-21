export interface PreAuthorizedCodeRecord {
  code: string;
  clientId: string;
  walletNonce: string;
  codeChallenge: string;
  codeChallengeMethod: 'S256';
  cNonce: string;
  cNonceExpiresAt: number;
  expiresAt: number;
  used: boolean;
  lastRedemptionAt?: number;
  txCodeRequired: boolean;
  txCodeHash?: string;
  txCodeExpiresAt?: number;
}

export interface RedeemUpdate {
  walletNonce: string;
  cNonce: string;
  cNonceExpiresAt: number;
  lastRedemptionAt: number;
  usedTtlSeconds: number;
}

export interface RedeemOutcome {
  status: 'ok' | 'used' | 'expired' | 'missing' | 'wallet_mismatch';
  record?: PreAuthorizedCodeRecord;
}

export interface PreAuthorizedCodeStore {
  kind(): 'memory' | 'redis';
  saveCode(record: PreAuthorizedCodeRecord, ttlSeconds: number): Promise<void>;
  getCode(code: string): Promise<PreAuthorizedCodeRecord | undefined>;
  deleteCode(code: string): Promise<void>;
  markCodeRedeemed(code: string, update: RedeemUpdate): Promise<RedeemOutcome>;
  saveNonce(nonce: string, ttlSeconds: number): Promise<void>;
  consumeNonce(nonce: string): Promise<boolean>;
  clear(): Promise<void>;
  ping?(): Promise<string>;
}

type Timer = ReturnType<typeof setTimeout>;

export class InMemoryPreAuthorizedCodeStore implements PreAuthorizedCodeStore {
  private records = new Map<string, PreAuthorizedCodeRecord>();
  private nonces = new Map<string, number>();
  private nonceTimers = new Map<string, Timer>();

  kind(): 'memory' | 'redis' {
    return 'memory';
  }

  async saveCode(record: PreAuthorizedCodeRecord, _ttlSeconds: number): Promise<void> {
    this.records.set(record.code, { ...record });
  }

  async getCode(code: string): Promise<PreAuthorizedCodeRecord | undefined> {
    const record = this.records.get(code);
    return record ? { ...record } : undefined;
  }

  async deleteCode(code: string): Promise<void> {
    this.records.delete(code);
  }

  async markCodeRedeemed(code: string, update: RedeemUpdate): Promise<RedeemOutcome> {
    const record = this.records.get(code);
    if (!record) return { status: 'missing' };
    if (record.expiresAt < update.lastRedemptionAt) {
      this.records.delete(code);
      return { status: 'expired' };
    }
    if (record.used) {
      return { status: 'used', record: { ...record } };
    }
    if (record.walletNonce !== update.walletNonce) {
      return { status: 'wallet_mismatch' };
    }
    const updated: PreAuthorizedCodeRecord = {
      ...record,
      used: true,
      lastRedemptionAt: update.lastRedemptionAt,
      cNonce: update.cNonce,
      cNonceExpiresAt: update.cNonceExpiresAt,
      expiresAt: update.lastRedemptionAt + update.usedTtlSeconds * 1000,
    };
    this.records.set(code, updated);
    return { status: 'ok', record: { ...updated } };
  }

  async saveNonce(nonce: string, ttlSeconds: number): Promise<void> {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.nonces.set(nonce, expiresAt);
    if (this.nonceTimers.has(nonce)) {
      clearTimeout(this.nonceTimers.get(nonce)!);
    }
    const timer = setTimeout(() => {
      this.nonces.delete(nonce);
      this.nonceTimers.delete(nonce);
    }, ttlSeconds * 1000);
    if (typeof (timer as any).unref === 'function') {
      (timer as any).unref();
    }
    this.nonceTimers.set(nonce, timer);
  }

  async consumeNonce(nonce: string): Promise<boolean> {
    const expiresAt = this.nonces.get(nonce);
    if (!expiresAt) return false;
    if (expiresAt < Date.now()) {
      this.nonces.delete(nonce);
      return false;
    }
    this.nonces.delete(nonce);
    if (this.nonceTimers.has(nonce)) {
      clearTimeout(this.nonceTimers.get(nonce)!);
      this.nonceTimers.delete(nonce);
    }
    return true;
  }

  async clear(): Promise<void> {
    this.records.clear();
    this.nonces.clear();
    for (const timer of this.nonceTimers.values()) {
      clearTimeout(timer);
    }
    this.nonceTimers.clear();
  }
}

export interface RedisClientLike {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, options: { PX: number; NX?: boolean }): Promise<string | null>;
  del(key: string | string[]): Promise<number>;
  eval<T = unknown>(script: string, options: { keys?: string[]; arguments?: (string | number)[] }): Promise<T>;
  scanIterator(options: { MATCH: string; COUNT?: number }): AsyncIterable<string>;
  ping(): Promise<string>;
}

type RedeemScriptResult = RedeemOutcome;

const MARK_USED_SCRIPT = `
local key = KEYS[1]
local walletNonce = ARGV[1]
local now = tonumber(ARGV[2])
local usedTtlMs = tonumber(ARGV[3])
local newNonce = ARGV[4]
local newNonceExpiry = tonumber(ARGV[5])
local raw = redis.call('GET', key)
if not raw then
  return cjson.encode({ status = 'missing' })
end
local data = cjson.decode(raw)
if tonumber(data.expiresAt) < now then
  redis.call('DEL', key)
  return cjson.encode({ status = 'expired' })
end
if data.used then
  return cjson.encode({ status = 'used', record = data })
end
if data.walletNonce ~= walletNonce then
  return cjson.encode({ status = 'wallet_mismatch' })
end
data.used = true
data.lastRedemptionAt = now
data.cNonce = newNonce
data.cNonceExpiresAt = newNonceExpiry
data.expiresAt = now + usedTtlMs
local encoded = cjson.encode(data)
redis.call('SET', key, encoded, 'PX', usedTtlMs)
return cjson.encode({ status = 'ok', record = data })
`;

export class RedisPreAuthorizedCodeStore implements PreAuthorizedCodeStore {
  private readonly codePrefix: string;
  private readonly noncePrefix: string;

  constructor(private readonly client: RedisClientLike, prefix = 'oidc4vci:preauth:') {
    this.codePrefix = `${prefix}code:`;
    this.noncePrefix = `${prefix}nonce:`;
  }

  kind(): 'memory' | 'redis' {
    return 'redis';
  }

  async saveCode(record: PreAuthorizedCodeRecord, ttlSeconds: number): Promise<void> {
    const payload = JSON.stringify(record);
    const result = await this.client.set(this.codeKey(record.code), payload, { PX: ttlSeconds * 1000, NX: true });
    if (result !== 'OK') {
      throw new Error('pre_authorized_code_collision');
    }
  }

  async getCode(code: string): Promise<PreAuthorizedCodeRecord | undefined> {
    const raw = await this.client.get(this.codeKey(code));
    if (!raw) return undefined;
    try {
      return JSON.parse(raw) as PreAuthorizedCodeRecord;
    } catch {
      return undefined;
    }
  }

  async deleteCode(code: string): Promise<void> {
    await this.client.del(this.codeKey(code));
  }

  async markCodeRedeemed(code: string, update: RedeemUpdate): Promise<RedeemOutcome> {
    const raw = await this.client.eval<string>(MARK_USED_SCRIPT, {
      keys: [this.codeKey(code)],
      arguments: [
        update.walletNonce,
        String(update.lastRedemptionAt),
        String(update.usedTtlSeconds * 1000),
        update.cNonce,
        String(update.cNonceExpiresAt),
      ],
    });
    if (!raw) return { status: 'missing' };
    let parsed: RedeemScriptResult;
    try {
      parsed = JSON.parse(raw) as RedeemScriptResult;
    } catch {
      return { status: 'missing' };
    }
    if (parsed.status !== 'ok' || !parsed.record) {
      return parsed;
    }
    return { status: 'ok', record: parsed.record };
  }

  async saveNonce(nonce: string, ttlSeconds: number): Promise<void> {
    await this.client.set(this.nonceKey(nonce), '1', { PX: ttlSeconds * 1000 });
  }

  async consumeNonce(nonce: string): Promise<boolean> {
    const result = await this.client.eval<number>(
      `
local key = KEYS[1]
local value = redis.call('GET', key)
if not value then
  return 0
end
redis.call('DEL', key)
return 1
`,
      { keys: [this.nonceKey(nonce)] }
    );
    return result === 1;
  }

  async clear(): Promise<void> {
    const pending: string[] = [];
    for await (const key of this.client.scanIterator({ MATCH: `${this.codePrefix}*` })) {
      pending.push(key);
    }
    for await (const key of this.client.scanIterator({ MATCH: `${this.noncePrefix}*` })) {
      pending.push(key);
    }
    if (pending.length) {
      await this.client.del(pending);
    }
  }

  ping(): Promise<string> {
    return this.client.ping();
  }

  private codeKey(code: string): string {
    return `${this.codePrefix}${code}`;
  }

  private nonceKey(nonce: string): string {
    return `${this.noncePrefix}${nonce}`;
  }
}
