import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const alice = await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: {},
    create: { name: 'Alice', email: 'alice@example.com' },
  });

  await prisma.credential.createMany({
    data: [
      {
        name: 'Nursing License',
        issuer: 'State Board of Nursing',
        userId: alice.id,
        hash: '0x' + 'a'.repeat(64),
        payloadEnc: Buffer.from(JSON.stringify({ license: 'NUR-123' })).toString('base64'),
        iv: 'iv-placeholder-16b',
        alg: 'AES-256-GCM'
      }
    ]
  });
}

main().catch(e => { console.error(e); process.exit(1); });
