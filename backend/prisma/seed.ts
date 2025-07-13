import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const issuer = await prisma.issuer.create({
    data: { name: 'General Hospital' }
  });

  const clinician = await prisma.clinician.create({
    data: {
      firstName: 'John',
      lastName: 'Doe'
    }
  });

  await prisma.credential.create({
    data: {
      type: 'Medical License',
      clinicianId: clinician.id,
      issuerId: issuer.id
    }
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
