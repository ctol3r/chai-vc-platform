import { EventEmitter } from 'events';

export type CredentialRevokedEvent = { id: number };
export type AlertScheduledEvent = { id: number; when: Date; kind: 'EXPIRY_60' | 'EXPIRY_30' };

export const eventBus = new EventEmitter();

