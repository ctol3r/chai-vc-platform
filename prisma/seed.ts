/**
 * Seed quickpatch: fill required fields for CredentialCreateManyInput.
 * Replace with real encryption payload generator later.
 */
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const alice = await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: {},
    create: { email: 'alice@example.com', name: 'Alice' },
  });

  const bob = await prisma.user.upsert({
    where: { email: 'bob@example.com' },
    update: {},
    create: { email: 'bob@example.com', name: 'Bob' },
  });

  await prisma.credential.createMany({
    data: [
      {
        name: 'Nursing License',
        issuer: 'State Board of Nursing',
        userId: alice.id,
        hash: '0x' + 'a'.repeat(64),
        payloadEnc: '{}',
        iv: 'iv-placeholder',
        alg: 'AES-256-GCM',
      },
      {
        name: 'Pharmacy Certification',
        issuer: 'Board of Pharmacy',
        userId: bob.id,
        hash: '0x' + 'b'.repeat(64),
        payloadEnc: '{}',
        iv: 'iv-placeholder',
        alg: 'AES-256-GCM',
      },
    ],
  });

  console.log('Seed complete');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
}).finally(() => {
  prisma.$disconnect();
});
