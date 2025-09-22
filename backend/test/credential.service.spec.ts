import { encryptJson } from '../src/crypto/field_encryption';
import { createCredential, getCredentialByHash, updateStatus } from '../src/services/credential.service';
import { PrismaClient, CredentialStatus } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();
const KEY = crypto.randomBytes(32);

describe('Credential Prisma model', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('creates, reads, updates with encrypted payload and deterministic hash', async () => {
    const vc = { type: 'License', issuer: 'did:web:board.example', subject: 'did:key:abc', degree: 'MD' };
    const { payloadEnc, iv, alg } = encryptJson(vc, KEY);

    const created = await createCredential({
      name: 'Medical License',
      issuer: 'did:web:board.example',
      vcCanonicalJson: JSON.stringify(vc),
      payloadEnc, iv, alg,
      userId: 1,
    });

    expect(created.hash).toHaveLength(64);
    expect(created.payloadEnc).toBeDefined();

    const fetched = await getCredentialByHash(created.hash);
    expect(fetched?.issuer).toBe('did:web:board.example');

    const updated = await updateStatus(created.hash, CredentialStatus.VERIFIED);
    expect(updated.status).toBe(CredentialStatus.VERIFIED);
  });
});

