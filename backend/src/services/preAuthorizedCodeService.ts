import crypto from 'crypto';

interface PreAuthorizedCodeRecord {
  code: string;
  clientId: string;
  walletNonce: string;
  cNonce: string;
  expiresAt: number;
  used: boolean;
}

export interface IssueCodeParams {
  clientId: string;
  walletNonce: string;
  expiresIn?: number;
}

export interface IssueCodeResult {
  preAuthorizedCode: string;
  cNonce: string;
  expiresIn: number;
}

export interface RedeemCodeResult {
  cNonce: string;
}

export class PreAuthorizedCodeService {
  private records = new Map<string, PreAuthorizedCodeRecord>();

  issue(params: IssueCodeParams): IssueCodeResult {
    const expiresIn = params.expiresIn ?? 5 * 60;
    const code = this.randomString();
    const cNonce = this.randomString();
    const expiresAt = Date.now() + expiresIn * 1000;
    this.records.set(code, {
      code,
      clientId: params.clientId,
      walletNonce: params.walletNonce,
      cNonce,
      expiresAt,
      used: false,
    });
    return { preAuthorizedCode: code, cNonce, expiresIn };
  }

  redeem(code: string, walletNonce: string): RedeemCodeResult {
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
    record.used = true;
    return { cNonce: record.cNonce };
  }

  clear(): void {
    this.records.clear();
  }

  private randomString(): string {
    return crypto.randomBytes(24).toString('base64url');
  }
}

export const preAuthorizedCodeService = new PreAuthorizedCodeService();
