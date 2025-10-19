import { PrismaClient, CredentialStatus } from '@prisma/client';
import { verifyCredentialFHIR, ChainBridge } from '../src/controllers/verification_controller';
import { encryptPayload } from '../src/utils/crypto';

class MockBridge implements ChainBridge {
  private set = new Set<string>();
  setValid(h: string) { this.set.add(h); }
  async validate(h: string): Promise<boolean> { return this.set.has(h); }
}

describe('VerificationResult endpoint logic', () => {
  const prisma = new PrismaClient();
  const keyEnv = process.env.CREDENTIAL_ENC_KEY;
  beforeAll(() => {
    if (!process.env.CREDENTIAL_ENC_KEY) {
      process.env.CREDENTIAL_ENC_KEY = Buffer.alloc(32, 4).toString('base64');
    }
  });
  afterAll(async () => {
    if (!keyEnv) delete process.env.CREDENTIAL_ENC_KEY;
    await prisma.$disconnect();
  });

  it('fails when payload is tampered', async () => {
    const good = JSON.stringify({ foo: 'bar' });
    const crypto = await import('crypto');
    const hash = crypto.createHash('sha256').update(good).digest('hex');
    const tampered = JSON.stringify({ foo: 'baz' });
    const { ciphertextB64, ivB64, alg } = encryptPayload(tampered);
    const rec = await prisma.credential.create({ data: { name: 'C', issuer: 'did:chai:issuer', status: CredentialStatus.REQUESTED, hash, payloadEnc: ciphertextB64, iv: ivB64, alg } });
    const bridge = new MockBridge();
    bridge.setValid(hash);
    const vr = await verifyCredentialFHIR(rec.id, { prisma, bridge });
    expect(vr.result).toBe('fail');
  });

  it('passes when payload and chain are valid', async () => {
    const good = JSON.stringify({ foo: 'bar' });
    const crypto = await import('crypto');
    const hash = crypto.createHash('sha256').update(good).digest('hex');
    const { ciphertextB64, ivB64, alg } = encryptPayload(good);
    const rec = await prisma.credential.create({ data: { name: 'C2', issuer: 'did:chai:issuer', status: CredentialStatus.REQUESTED, hash, payloadEnc: ciphertextB64, iv: ivB64, alg } });
    const bridge = new MockBridge();
    bridge.setValid(hash);
    const vr = await verifyCredentialFHIR(rec.id, { prisma, bridge });
    expect(vr.result).toBe('pass');
    expect(vr.resourceType).toBe('VerificationResult');
  });
});
