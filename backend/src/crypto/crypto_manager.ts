import { PQScheme } from './pq_scheme';
import { DefaultScheme } from './default_scheme';

let activeScheme: PQScheme = new DefaultScheme();

export function setScheme(scheme: PQScheme) {
    activeScheme = scheme;
}

export function getScheme(): PQScheme {
    return activeScheme;
}

export async function signMessage(message: Buffer): Promise<Buffer> {
    const keys = await activeScheme.keyGen();
    return activeScheme.sign(keys.privateKey, message);
}

export async function verifyMessage(publicKey: string, message: Buffer, signature: Buffer): Promise<boolean> {
    return activeScheme.verify(publicKey, message, signature);
}
