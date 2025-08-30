import { PrismaClient, CredentialStatus } from '@prisma/client';
import crypto from 'crypto';
const prisma = new PrismaClient();

// Deterministic SHA-256 of canonical VC JSON (unencrypted VC or its canonical form)
export function vcHash(vcCanonicalJson: string) {
  return crypto.createHash('sha256').update(vcCanonicalJson).digest('hex');
}

export async function createCredential(input: {
  name: string;
  issuer: string;           // DID
  vcCanonicalJson: string;  // pre-encryption canonical JSON
  payloadEnc: string;
  iv: string;
  alg: string;
  userId?: number;
  expiresAt?: Date;
}) {
  return prisma.credential.create({
    data: {
      name: input.name,
      issuer: input.issuer,
      issuedAt: new Date(),
      status: CredentialStatus.REQUESTED,
      expiresAt: input.expiresAt ?? null,
      hash: vcHash(input.vcCanonicalJson),
      payloadEnc: input.payloadEnc,
      iv: input.iv,
      alg: input.alg,
      userId: input.userId ?? null,
    },
  });
}

export async function getCredentialByHash(hash: string) {
  return prisma.credential.findUnique({ where: { hash } });
}

export async function listCredentialsByUser(userId: number) {
  return prisma.credential.findMany({ where: { userId }, orderBy: { issuedAt: 'desc' } });
}

export async function updateStatus(hash: string, status: CredentialStatus) {
  return prisma.credential.update({ where: { hash }, data: { status } });
}

