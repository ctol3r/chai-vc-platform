import crypto from 'crypto';
import {
  InMemoryPreAuthorizedCodeStore,
  PreAuthorizedCodeRecord,
  PreAuthorizedCodeStore,
  RedisPreAuthorizedCodeStore,
  RedeemOutcome,
} from './preAuthorizedCodeStore';
import { createRedisClient, probeRedis, redisLog } from './redisClientFactory';

export interface IssueCodeParams {
  clientId: string;
  walletNonce: string;
  expiresIn?: number;
  cNonceExpiresIn?: number;
  codeChallenge: string;
  codeChallengeMethod?: 'S256' | 'plain';
  txCode?: string;
  txCodeRequired?: boolean;
}

export interface IssueCodeResult {
  preAuthorizedCode: string;
  cNonce: string;
  expiresIn: number;
  cNonceExpiresIn: number;
  txCodeRequired: boolean;
  txCode?: string;
}

export interface RedeemCodeResult {
  accessToken: string;
  cNonce: string;
  expiresIn: number;
  cNonceExpiresIn: number;
}

interface PreAuthorizedCodeServiceOptions {
  store?: PreAuthorizedCodeStore;
  requireTxCode?: boolean;
  txCodeLength?: number;
  tokenExpiresIn?: number;
  nonceTtlSeconds?: number;
  codeTtlSeconds?: number;
  txCodeTtlSeconds?: number;
  usedCodeTtlSeconds?: number;
}

const PRE_AUTH_STORE_CHOICE = (process.env.OIDC_PRE_AUTH_STORE ?? '').toLowerCase();
const REQUIRE_TX_CODE_ENV = (process.env.OIDC_REQUIRE_TX_CODE ?? '').toLowerCase();

const DEFAULT_CODE_TTL_SECONDS = 12 * 60; // 12 minutes
const DEFAULT_NONCE_TTL_SECONDS = 90; // 90 seconds
const DEFAULT_TX_CODE_TTL_SECONDS = 3 * 60; // 3 minutes
const USED_CODE_TTL_SECONDS = 5 * 60; // retain used code marker for 5 minutes

function tryCreateRedisStore(): RedisPreAuthorizedCodeStore | undefined {
  if (PRE_AUTH_STORE_CHOICE !== 'redis') {
    return undefined;
  }
  const url = process.env.REDIS_URL;
  if (!url) {
    redisLog('debug', '[OIDC4VCI] REDIS_URL not set; defaulting to in-memory pre-authorized code store.');
    return undefined;
  }
  const probe = probeRedis(url);
  if (!probe.ok) {
    if (probe.permissionDenied) {
      redisLog('warn', '[OIDC4VCI] Redis access denied; defaulting to in-memory pre-authorized code store.', {
        error: probe.error,
      });
    } else {
      redisLog('debug', '[OIDC4VCI] Redis probe unavailable; defaulting to in-memory pre-authorized code store.', {
        error: probe.error,
        modeTried: probe.mode,
      });
    }
    return undefined;
  }
  const client = createRedisClient(url);
  if (!client) {
    redisLog('debug', '[OIDC4VCI] Redis client initialization returned undefined; defaulting to in-memory store.', {
      mode: probe.mode,
    });
    return undefined;
  }
  return new RedisPreAuthorizedCodeStore(client);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export class PreAuthorizedCodeService {
  private store: PreAuthorizedCodeStore;
  private readonly defaultTxCodeRequired: boolean;
  private readonly txCodeLength: number;
  private readonly tokenExpiresIn: number;
  private readonly codeTtlSeconds: number;
  private readonly nonceTtlSeconds: number;
  private readonly txCodeTtlSeconds: number;
  private readonly usedCodeTtlSeconds: number;

  constructor(options: PreAuthorizedCodeServiceOptions = {}) {
    const resolvedStore = options.store ?? tryCreateRedisStore() ?? new InMemoryPreAuthorizedCodeStore();
    this.store = resolvedStore;
    this.defaultTxCodeRequired =
      options.requireTxCode ?? ['true', '1', 'yes', 'on'].includes(REQUIRE_TX_CODE_ENV);
    const lengthFromEnv = Number(process.env.OIDC_TX_CODE_LENGTH ?? '6');
    this.txCodeLength = options.txCodeLength ?? (Number.isFinite(lengthFromEnv) && lengthFromEnv >= 4 ? lengthFromEnv : 6);
    this.tokenExpiresIn = options.tokenExpiresIn ?? 10 * 60;
    this.codeTtlSeconds = options.codeTtlSeconds ?? DEFAULT_CODE_TTL_SECONDS;
    this.nonceTtlSeconds = options.nonceTtlSeconds ?? DEFAULT_NONCE_TTL_SECONDS;
    this.txCodeTtlSeconds = options.txCodeTtlSeconds ?? DEFAULT_TX_CODE_TTL_SECONDS;
    this.usedCodeTtlSeconds = options.usedCodeTtlSeconds ?? USED_CODE_TTL_SECONDS;
  }

  async issue(params: IssueCodeParams): Promise<IssueCodeResult> {
    if (!params.codeChallenge) {
      throw new Error('code_challenge_required');
    }
    if (params.codeChallengeMethod && params.codeChallengeMethod !== 'S256') {
      throw new Error('unsupported_code_challenge_method');
    }
    const now = Date.now();
    const expiresInSeconds = clamp(params.expiresIn ?? this.codeTtlSeconds, 10 * 60, 15 * 60);
    const cNonceExpiresIn = clamp(params.cNonceExpiresIn ?? this.nonceTtlSeconds, 60, 120);
    const preAuthorizedCode = this.randomString();
    const nonce = this.createNonce(cNonceExpiresIn);

    const txCodeRequired = params.txCodeRequired ?? this.defaultTxCodeRequired;
    let txCode = params.txCode;
    let txCodeHash: string | undefined;
    let txCodeExpiresAt: number | undefined;
    if (txCodeRequired) {
      txCode = txCode ?? this.generateTxCode();
      txCodeHash = this.hashTxCode(txCode);
      txCodeExpiresAt = now + this.txCodeTtlSeconds * 1000;
    }

    const record: PreAuthorizedCodeRecord = {
      code: preAuthorizedCode,
      clientId: params.clientId,
      walletNonce: params.walletNonce,
      codeChallenge: params.codeChallenge,
      codeChallengeMethod: 'S256',
      cNonce: nonce.value,
      cNonceExpiresAt: nonce.expiresAt,
      expiresAt: now + expiresInSeconds * 1000,
      used: false,
      txCodeRequired,
      txCodeHash,
      txCodeExpiresAt,
    };

    await this.store.saveCode(record, expiresInSeconds);
    await this.store.saveNonce(nonce.value, nonce.ttlSeconds);

    return {
      preAuthorizedCode,
      cNonce: nonce.value,
      expiresIn: expiresInSeconds,
      cNonceExpiresIn,
      txCodeRequired,
      txCode: txCodeRequired ? txCode : undefined,
    };
  }

  async redeem(
    code: string,
    walletNonce: string,
    codeVerifier: string | undefined,
    grantType: string,
    txCode?: string
  ): Promise<RedeemCodeResult> {
    if (grantType !== 'urn:ietf:params:oauth:grant-type:pre-authorized_code') {
      throw new Error('unsupported_grant_type');
    }
    if (!codeVerifier) {
      throw new Error('missing_code_verifier');
    }
    const record = await this.store.getCode(code);
    if (!record) {
      throw new Error('invalid_pre_authorized_code');
    }
    const now = Date.now();
    if (record.expiresAt < now) {
      await this.store.deleteCode(code);
      throw new Error('pre_authorized_code_expired');
    }
    if (record.walletNonce !== walletNonce) {
      throw new Error('nonce_mismatch');
    }
    if (!this.verifyCodeChallenge(record, codeVerifier)) {
      throw new Error('invalid_code_verifier');
    }
    if (record.txCodeRequired) {
      if (!txCode) {
        throw new Error('missing_tx_code');
      }
      if (!record.txCodeHash) {
        throw new Error('invalid_tx_code');
      }
      if (record.txCodeExpiresAt && record.txCodeExpiresAt < now) {
        await this.store.deleteCode(code);
        throw new Error('tx_code_expired');
      }
      if (this.hashTxCode(txCode) !== record.txCodeHash) {
        throw new Error('invalid_tx_code');
      }
    }
    const nonceConsumed = await this.store.consumeNonce(record.cNonce);
    if (!nonceConsumed) {
      throw new Error('replay_detected');
    }

    const refreshedNonce = this.createNonce();
    await this.store.saveNonce(refreshedNonce.value, refreshedNonce.ttlSeconds);

    const outcome = await this.store.markCodeRedeemed(code, {
      walletNonce,
      cNonce: refreshedNonce.value,
      cNonceExpiresAt: refreshedNonce.expiresAt,
      lastRedemptionAt: now,
      usedTtlSeconds: this.usedCodeTtlSeconds,
    });

    this.assertRedeemOutcome(outcome);

    const accessToken = this.generateAccessToken();
    return {
      cNonce: refreshedNonce.value,
      accessToken,
      expiresIn: this.tokenExpiresIn,
      cNonceExpiresIn: refreshedNonce.ttlSeconds,
    };
  }

  async issueNonce(cNonceExpiresIn = this.nonceTtlSeconds): Promise<{ cNonce: string; cNonceExpiresIn: number }> {
    const nonce = this.createNonce(clamp(cNonceExpiresIn, 60, 120));
    await this.store.saveNonce(nonce.value, nonce.ttlSeconds);
    return { cNonce: nonce.value, cNonceExpiresIn: nonce.ttlSeconds };
  }

  async clear(): Promise<void> {
    await this.store.clear();
  }

  useStore(store: PreAuthorizedCodeStore): void {
    this.store = store;
  }

  isRedisBacked(): boolean {
    return this.store.kind() === 'redis';
  }

  isTxCodeRequiredByDefault(): boolean {
    return this.defaultTxCodeRequired;
  }

  getTxCodeLength(): number {
    return this.txCodeLength;
  }

  async checkRedisHealth(): Promise<boolean> {
    if (!this.isRedisBacked() || typeof this.store.ping !== 'function') {
      throw new Error('redis_not_configured');
    }
    const reply = await this.store.ping();
    if (typeof reply === 'string' && reply.toUpperCase() === 'PONG') {
      return true;
    }
    throw new Error('redis_unhealthy');
  }

  private randomString(): string {
    return crypto.randomBytes(24).toString('base64url');
  }

  private createNonce(ttlSeconds = this.nonceTtlSeconds): { value: string; expiresAt: number; ttlSeconds: number } {
    const ttl = ttlSeconds > 0 ? ttlSeconds : this.nonceTtlSeconds;
    const value = this.randomString();
    const expiresAt = Date.now() + ttl * 1000;
    return { value, expiresAt, ttlSeconds: ttl };
  }

  private verifyCodeChallenge(record: PreAuthorizedCodeRecord, verifier: string): boolean {
    if (record.codeChallengeMethod !== 'S256') {
      return false;
    }
    const digest = crypto.createHash('sha256').update(verifier).digest('base64url');
    return digest === record.codeChallenge;
  }

  private generateTxCode(): string {
    const digits = '0123456789';
    let output = '';
    for (let i = 0; i < this.txCodeLength; i += 1) {
      const idx = crypto.randomInt(0, digits.length);
      output += digits[idx];
    }
    return output;
  }

  private hashTxCode(txCode: string): string {
    return crypto.createHash('sha256').update(txCode).digest('base64url');
  }

  private assertRedeemOutcome(outcome: RedeemOutcome): void {
    switch (outcome.status) {
      case 'ok':
        return;
      case 'used':
        throw new Error('pre_authorized_code_already_used');
      case 'expired':
        throw new Error('pre_authorized_code_expired');
      case 'wallet_mismatch':
        throw new Error('nonce_mismatch');
      case 'missing':
      default:
        throw new Error('invalid_pre_authorized_code');
    }
  }

  private generateAccessToken(): string {
    return crypto.randomBytes(32).toString('base64url');
  }
}

export const preAuthorizedCodeService = new PreAuthorizedCodeService();
