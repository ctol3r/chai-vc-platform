import { eventBus } from '../events/event_bus';

export type AlertKind = 'EXPIRY_60' | 'EXPIRY_30';

export interface AlertScheduler {
  scheduleAlert(credentialId: number, when: Date, kind: AlertKind): Promise<void>;
}

class DefaultAlertScheduler implements AlertScheduler {
  async scheduleAlert(credentialId: number, when: Date, kind: AlertKind): Promise<void> {
    // In a real system, enqueue to a durable scheduler (e.g., BullMQ, cron, etc.)
    eventBus.emit('AlertScheduled', { id: credentialId, when, kind });
    console.log('AlertScheduled:', { id: credentialId, when: when.toISOString(), kind });
  }
}

export const alertScheduler: AlertScheduler = new DefaultAlertScheduler();
