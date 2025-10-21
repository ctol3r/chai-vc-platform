import { PrismaClient, CredentialStatus } from '@prisma/client';
import { issueCredentialE2E } from '../src/controllers/credential_controller';
import { PolkadotService } from '../src/blockchain/polkadot_service';

describe('E2E issuance flow (mocked happy-path)', () => {
  const prisma = new PrismaClient();
  const keyEnv = process.env.CREDENTIAL_ENC_KEY;
  beforeAll(() => {
    if (!process.env.CREDENTIAL_ENC_KEY) {
      process.env.CREDENTIAL_ENC_KEY = Buffer.alloc(32, 2).toString('base64');
    }
  });
  afterAll(async () => {
    if (!keyEnv) delete process.env.CREDENTIAL_ENC_KEY;
    await prisma.$disconnect();
  });

  it('signs, anchors, stores encrypted, and notifies wallet', async () => {
    const logs: string[] = [];
    const originalLog = console.log;
    console.log = (...args: any[]) => { logs.push(args.join(' ')); originalLog(...args); };
    try {
      const fakePolka = new PolkadotService();
      const notifyCalls: any[] = [];
      const res = await issueCredentialE2E(
        { subjectDid: 'did:chai:subject:alice', claims: { name: 'Alice' } },
        {
          polkadot: fakePolka,
          prisma,
          notify: async (p) => { notifyCalls.push(p); },
        }
      );

      expect(res.id).toBeTruthy();
      expect(res.status).toBe(CredentialStatus.REQUESTED);
      // On-chain event observed in logs
      const anchored = logs.find(l => l.includes('OnChainEvent: CredentialAnchored'));
      expect(anchored).toBeTruthy();
      // Wallet notified
      expect(notifyCalls.length).toBe(1);
      expect(notifyCalls[0].id).toBe(res.id);
      // Stored record exists and is encrypted
      const rec = await prisma.credential.findUnique({ where: { id: res.id } });
      expect(rec).toBeTruthy();
      expect(rec!.payloadEnc).toBeTruthy();
      expect(rec!.iv).toBeTruthy();
      expect(rec!.alg).toBe('AES-256-GCM');
    } finally {
      console.log = originalLog;
    }
  });
});
