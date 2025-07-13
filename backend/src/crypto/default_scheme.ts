import { generateKeyPairSync, createSign, createVerify } from 'crypto';
import { PQScheme } from './pq_scheme';

export class DefaultScheme implements PQScheme {
    async keyGen() {
        const { publicKey, privateKey } = generateKeyPairSync('ec', {
            namedCurve: 'P-256',
            publicKeyEncoding: { type: 'spki', format: 'pem' },
            privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
        });
        return { publicKey, privateKey };
    }

    async sign(privateKey: string, message: Buffer): Promise<Buffer> {
        const sign = createSign('SHA256');
        sign.update(message);
        sign.end();
        return sign.sign(privateKey);
    }

    async verify(publicKey: string, message: Buffer, signature: Buffer): Promise<boolean> {
        const verify = createVerify('SHA256');
        verify.update(message);
        verify.end();
        return verify.verify(publicKey, signature);
    }
}
