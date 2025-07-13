import crypto from 'crypto';
import fs from 'fs';

export interface WalletData {
  [key: string]: any;
}

export class WalletService {
  private filePath: string;
  private key: Buffer;
  private walletData: WalletData | null = null;
  private lockTimer: NodeJS.Timeout | null = null;
  private timeoutMs: number;

  constructor(filePath: string, encryptionKey: string, timeoutMs: number = 5 * 60 * 1000) {
    this.filePath = filePath;
    this.key = crypto.createHash('sha256').update(encryptionKey).digest();
    this.timeoutMs = timeoutMs;
  }

  private resetTimer() {
    if (this.lockTimer) {
      clearTimeout(this.lockTimer);
    }
    this.lockTimer = setTimeout(() => this.lock(), this.timeoutMs);
  }

  async load() {
    if (!fs.existsSync(this.filePath)) {
      this.walletData = {};
      await this.save();
    } else {
      const encrypted = await fs.promises.readFile(this.filePath, 'utf8');
      this.walletData = this.decrypt(encrypted);
    }
    this.resetTimer();
  }

  get data(): WalletData {
    if (!this.walletData) throw new Error('Wallet locked');
    this.resetTimer();
    return this.walletData;
  }

  async update(fn: (data: WalletData) => void) {
    if (!this.walletData) throw new Error('Wallet locked');
    fn(this.walletData);
    await this.save();
    this.resetTimer();
  }

  private async save() {
    if (this.walletData === null) return;
    const encrypted = this.encrypt(this.walletData);
    await fs.promises.writeFile(this.filePath, encrypted, 'utf8');
  }

  lock() {
    this.walletData = null;
    if (this.lockTimer) {
      clearTimeout(this.lockTimer);
      this.lockTimer = null;
    }
  }

  private encrypt(data: WalletData): string {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', this.key, iv);
    const json = JSON.stringify(data);
    const encrypted = Buffer.concat([cipher.update(json, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    return [iv.toString('base64'), encrypted.toString('base64'), tag.toString('base64')].join(':');
  }

  private decrypt(encrypted: string): WalletData {
    const [ivB64, dataB64, tagB64] = encrypted.split(':');
    const iv = Buffer.from(ivB64, 'base64');
    const tag = Buffer.from(tagB64, 'base64');
    const decipher = crypto.createDecipheriv('aes-256-gcm', this.key, iv);
    decipher.setAuthTag(tag);
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(dataB64, 'base64')),
      decipher.final(),
    ]);
    return JSON.parse(decrypted.toString('utf8'));
  }
}
