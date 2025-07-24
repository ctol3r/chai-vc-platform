import { EventEmitter } from 'events';

export interface RevocationWatcherOptions {
  endpoints: string[];
  pollingIntervalMs?: number;
}

/**
 * RevocationWatcher polls off-chain endpoints for lists of revoked credential IDs.
 * When a new revocation is discovered, a `revoked` event is emitted with the credential ID.
 */
export class RevocationWatcher extends EventEmitter {
  private seenRevocations: Set<string> = new Set();
  private timer?: NodeJS.Timeout;
  private endpoints: string[];
  private interval: number;

  constructor(options: RevocationWatcherOptions) {
    super();
    this.endpoints = options.endpoints;
    this.interval = options.pollingIntervalMs ?? 10000;
  }

  /** Start polling the endpoints. */
  start() {
    this.stop();
    this.timer = setInterval(() => this.poll(), this.interval);
    this.poll().catch(err => console.error('revocation watcher poll error', err));
  }

  /** Stop polling the endpoints. */
  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
  }

  private async poll() {
    for (const url of this.endpoints) {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          console.error(`failed to fetch ${url}: ${response.status} ${response.statusText}`);
          continue;
        }
        const data = await response.json();
        const revokedIds: string[] = Array.isArray((data as any).revokedCredentialIds)
          ? (data as any).revokedCredentialIds
          : [];
        for (const id of revokedIds) {
          if (!this.seenRevocations.has(id)) {
            this.seenRevocations.add(id);
            this.emit('revoked', id);
          }
        }
      } catch (err) {
        console.error(`error fetching ${url}`, err);
      }
    }
  }
}
