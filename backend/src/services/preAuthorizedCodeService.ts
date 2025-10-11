import crypto from 'crypto';

interface PreAuthorizedCodeRecord {
  code: string;
  clientId: string;
  walletNonce: string;
  codeChallenge: string;
  codeChallengeMethod: 'S256' | 'plain';
  cNonce: string;
  cNonceExpiresAt: number;
  expiresAt: number;
  used: boolean;
  lastRedemptionAt?: number;
}

export interface IssueCodeParams {
  clientId: string;
  walletNonce: string;
  expiresIn?: number;
  cNonceExpiresIn?: number;
  codeChallenge: string;
  codeChallengeMethod?: 'S256' | 'plain';
}

export interface IssueCodeResult {
  preAuthorizedCode: string;
  cNonce: string;
  expiresIn: number;
  cNonceExpiresIn: number;
}

export interface RedeemCodeResult {
  accessToken: string;
  cNonce: string;
  expiresIn: number;
}

export class PreAuthorizedCodeService {
  private records = new Map<string, PreAuthorizedCodeRecord>();
  private nonceRegistry = new Map<string, number>();

  issue(params: IssueCodeParams): IssueCodeResult {
    const expiresIn = params.expiresIn ?? 5 * 60;
    const cNonceExpiresIn = params.cNonceExpiresIn ?? 5 * 60;
    const code = this.randomString();
    const cNonce = this.randomString();
    const expiresAt = Date.now() + expiresIn * 1000;
    const cNonceExpiresAt = Date.now() + cNonceExpiresIn * 1000;
    this.records.set(code, {
      code,
      clientId: params.clientId,
      walletNonce: params.walletNonce,
       codeChallenge: params.codeChallenge,
       codeChallengeMethod: params.codeChallengeMethod ?? 'S256',
      cNonce,
       cNonceExpiresAt,
      expiresAt,
      used: false,
    });
    this.nonceRegistry.set(cNonce, cNonceExpiresAt);
    return { preAuthorizedCode: code, cNonce, expiresIn, cNonceExpiresIn };
  }

  redeem(code: string, walletNonce: string, codeVerifier: string, grantType: string): RedeemCodeResult {
    if (grantType !== 'urn:ietf:params:oauth:grant-type:pre-authorized_code') {
      throw new Error('unsupported_grant_type');
    }
    const record = this.records.get(code);
    if (!record) {
      throw new Error('invalid_pre_authorized_code');
    }
    if (record.used) {
      throw new Error('pre_authorized_code_already_used');
    }
    if (record.expiresAt < Date.now()) {
      this.records.delete(code);
      throw new Error('pre_authorized_code_expired');
    }
    if (record.walletNonce !== walletNonce) {
      throw new Error('nonce_mismatch');
    }
    if (!this.validateCodeVerifier(record, codeVerifier)) {
      throw new Error('invalid_code_verifier');
    }
    if (!this.consumeNonce(record.cNonce)) {
      throw new Error('replay_detected');
    }
    record.used = true;
    record.lastRedemptionAt = Date.now();
    const accessToken = `stub-${code}-${record.lastRedemptionAt}`;
    return { cNonce: record.cNonce, accessToken, expiresIn: 10 * 60 };
  }

  clear(): void {
    this.records.clear();
    this.nonceRegistry.clear();
  }

  private randomString(): string {
    return crypto.randomBytes(24).toString('base64url');
  }

  private validateCodeVerifier(record: PreAuthorizedCodeRecord, verifier: string): boolean {
    if (!verifier) return false;
    if (record.codeChallengeMethod === 'plain') {
      return verifier === record.codeChallenge;
    }
    const digest = crypto.createHash('sha256').update(verifier).digest('base64url');
    return digest === record.codeChallenge;
  }

  private consumeNonce(nonce: string): boolean {
    const expiry = this.nonceRegistry.get(nonce);
    if (!expiry) return false;
    if (expiry < Date.now()) {
      this.nonceRegistry.delete(nonce);
      return false;
    }
    this.nonceRegistry.delete(nonce);
    return true;
  }
}

export const preAuthorizedCodeService = new PreAuthorizedCodeService();
