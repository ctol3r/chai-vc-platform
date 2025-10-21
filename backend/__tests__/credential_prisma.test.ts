import { PrismaClient, CredentialStatus } from '@prisma/client';
import { encryptPayload, decryptPayload } from '../src/utils/crypto';

describe('Credential Prisma model', () => {
  const prisma = new PrismaClient();
  const keyEnv = process.env.CREDENTIAL_ENC_KEY;
  beforeAll(() => {
    if (!process.env.CREDENTIAL_ENC_KEY) {
      process.env.CREDENTIAL_ENC_KEY = Buffer.alloc(32, 1).toString('base64');
    }
  });
  afterAll(async () => {
    if (!keyEnv) delete process.env.CREDENTIAL_ENC_KEY;
    await prisma.$disconnect();
  });

  it('creates credential with encrypted payload', async () => {
    const payload = JSON.stringify({ npi: '1234567893', name: 'Alice Clinician' });
    const { ciphertextB64, ivB64, alg } = encryptPayload(payload);
    const c = await prisma.credential.create({
      data: {
        name: 'NPI Credential',
        issuer: 'did:chai:issuer:demo',
        status: CredentialStatus.REQUESTED,
        payloadEnc: ciphertextB64,
        iv: ivB64,
        alg,
      },
    });
    expect(c.id).toBeTruthy();
    expect(c.status).toBe('REQUESTED');
    const decrypted = decryptPayload(c.payloadEnc, c.iv);
    expect(JSON.parse(decrypted).npi).toBe('1234567893');
  });

  it('updates status to VERIFIED and REVOKED', async () => {
    const c = await prisma.credential.create({
      data: {
        name: 'Verify Me',
        issuer: 'did:chai:issuer:demo',
        status: CredentialStatus.REQUESTED,
        payloadEnc: 'AA==',
        iv: 'AA==',
        alg: 'AES-256-GCM',
      },
    });
    const v = await prisma.credential.update({ where: { id: c.id }, data: { status: CredentialStatus.VERIFIED } });
    expect(v.status).toBe('VERIFIED');
    const r = await prisma.credential.update({ where: { id: c.id }, data: { status: CredentialStatus.REVOKED } });
    expect(r.status).toBe('REVOKED');
  });
});
