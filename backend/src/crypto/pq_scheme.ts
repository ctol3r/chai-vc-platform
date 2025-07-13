export interface PQScheme {
    keyGen(): Promise<{ publicKey: string; privateKey: string }>;
    sign(privateKey: string, message: Buffer): Promise<Buffer>;
    verify(publicKey: string, message: Buffer, signature: Buffer): Promise<boolean>;
}
