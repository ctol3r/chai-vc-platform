export class WalletBackupService {
    private static algorithm = 'aes-256-cbc';

    /**
     * Encrypt a seed phrase using a password.
     */
    static encryptSeed(seedPhrase: string, password: string): string {
        const crypto = require('crypto');
        const key = crypto.scryptSync(password, 'salt', 32);
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(this.algorithm, key, iv);
        const encrypted = Buffer.concat([cipher.update(seedPhrase, 'utf8'), cipher.final()]);
        return iv.toString('hex') + ':' + encrypted.toString('hex');
    }

    /**
     * Decrypt a seed phrase.
     */
    static decryptSeed(encryptedSeed: string, password: string): string {
        const crypto = require('crypto');
        const [ivHex, dataHex] = encryptedSeed.split(':');
        const iv = Buffer.from(ivHex, 'hex');
        const encryptedText = Buffer.from(dataHex, 'hex');
        const key = crypto.scryptSync(password, 'salt', 32);
        const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
        const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);
        return decrypted.toString('utf8');
    }

    /**
     * Backup the seed phrase to a file, encrypted using the password.
     */
    static backupToFile(seedPhrase: string, password: string, filePath: string): void {
        const fs = require('fs');
        const encrypted = this.encryptSeed(seedPhrase, password);
        fs.writeFileSync(filePath, encrypted, { encoding: 'utf8' });
    }

    /**
     * Restore the seed phrase from a backup file.
     */
    static restoreFromFile(password: string, filePath: string): string {
        const fs = require('fs');
        const encrypted = fs.readFileSync(filePath, { encoding: 'utf8' });
        return this.decryptSeed(encrypted, password);
    }
}
