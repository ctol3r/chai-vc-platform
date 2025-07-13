import { signMessage } from '../crypto/crypto_manager';

export async function issueCredential(data: string): Promise<string> {
    const signature = await signMessage(Buffer.from(data));
    return signature.toString('base64');
}
