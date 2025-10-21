import request from 'supertest';
import app from '../src/app';
import { PrismaClient, CredentialStatus } from '@prisma/client';
import * as scheduler from '../src/scheduler/alert_scheduler';
import { eventBus } from '../src/events/event_bus';

describe('Revoke endpoint schedules alerts and emits events', () => {
  const prisma = new PrismaClient();
  let credId: number;
  const keyEnv = process.env.CREDENTIAL_ENC_KEY;
  beforeAll(async () => {
    if (!process.env.CREDENTIAL_ENC_KEY) {
      process.env.CREDENTIAL_ENC_KEY = Buffer.alloc(32, 3).toString('base64');
    }
    // seed a credential
    const rec = await prisma.credential.create({
      data: {
        name: 'To Revoke',
        issuer: 'did:chai:issuer:demo',
        status: CredentialStatus.REQUESTED,
        payloadEnc: 'AA==',
        iv: 'AA==',
        alg: 'AES-256-GCM',
      },
    });
    credId = rec.id;
  });
  afterAll(async () => {
    if (!keyEnv) delete process.env.CREDENTIAL_ENC_KEY;
    await prisma.$disconnect();
  });

  it('flips status and schedules 60/30-day alerts with events', async () => {
    const calls: any[] = [];
    const orig = scheduler.alertScheduler.scheduleAlert.bind(scheduler.alertScheduler);
    jest.spyOn(scheduler.alertScheduler, 'scheduleAlert').mockImplementation(async (id, when, kind) => {
      calls.push({ id, when, kind });
      return orig(id, when, kind);
    });
    const events: any[] = [];
    const onRevoke = (p: any) => events.push({ type: 'revoked', payload: p });
    eventBus.on('CredentialRevoked', onRevoke);

    const res = await request(app).post(`/credentials/${credId}/revoke`).send({});
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(credId);
    expect(res.body.status).toBe('REVOKED');

    const db = await prisma.credential.findUnique({ where: { id: credId } });
    expect(db!.status).toBe('REVOKED');
    // Two alerts
    expect(calls.length).toBe(2);
    const now = Date.now();
    for (const c of calls) {
      expect(c.id).toBe(credId);
      expect(c.when.getTime()).toBeGreaterThan(now);
      expect(['EXPIRY_60', 'EXPIRY_30']).toContain(c.kind);
    }
    // Event emitted
    expect(events.find(e => e.type === 'revoked' && e.payload.id === credId)).toBeTruthy();

    eventBus.off('CredentialRevoked', onRevoke);
  });
});
