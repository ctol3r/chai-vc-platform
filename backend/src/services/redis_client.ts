import { createClient, RedisClientType } from 'redis';

export class RedisClient {
  private client!: RedisClientType;

  async connect(url?: string) {
    this.client = createClient({ url: url || process.env.REDIS_URL });
    this.client.on('error', (e) => console.error('redis_error', e));
    await this.client.connect();
  }

  async ping(): Promise<string> {
    if (!this.client) throw new Error('redis_not_configured');
    return this.client.ping();
  }

  get raw(): RedisClientType {
    if (!this.client) throw new Error('redis_not_configured');
    return this.client;
  }
}
