import { execFile, spawnSync } from 'child_process';
import { promisify } from 'util';
import { RedisClientLike } from './preAuthorizedCodeStore';

const execFileAsync = promisify(execFile);

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

function currentLogLevel(): LogLevel {
  const raw = (process.env.LOG_LEVEL ?? 'info').toLowerCase();
  if (raw === 'debug' || raw === 'info' || raw === 'warn' || raw === 'error') {
    return raw;
  }
  return 'info';
}

function shouldLog(level: LogLevel): boolean {
  return LEVEL_ORDER[level] >= LEVEL_ORDER[currentLogLevel()];
}

export function redisLog(level: LogLevel, message: string, meta?: Record<string, unknown>): void {
  if (!shouldLog(level)) return;
  const payload = meta ? `${message} ${JSON.stringify(meta)}` : message;
  switch (level) {
    case 'debug':
      console.debug(payload);
      break;
    case 'info':
      console.info(payload);
      break;
    case 'warn':
      console.warn(payload);
      break;
    case 'error':
    default:
      console.error(payload);
      break;
  }
}

interface NodeRedisClient {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, options: { PX: number; NX?: boolean }): Promise<string | null>;
  del(key: string | string[]): Promise<number>;
  eval<T = unknown>(script: string, options: { keys?: string[]; arguments?: (string | number)[] }): Promise<T>;
  scanIterator(options: { MATCH: string; COUNT?: number }): AsyncIterable<string>;
  ping(): Promise<string>;
  connect?: () => Promise<void>;
  isOpen?: boolean;
  on?: (event: string, handler: (err: unknown) => void) => void;
}

class RedisModuleAdapter implements RedisClientLike {
  constructor(private readonly client: NodeRedisClient) {}

  get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  set(key: string, value: string, options: { PX: number; NX?: boolean }): Promise<string | null> {
    return this.client.set(key, value, options);
  }

  del(key: string | string[]): Promise<number> {
    return this.client.del(key);
  }

  eval<T = unknown>(script: string, options: { keys?: string[]; arguments?: (string | number)[] }): Promise<T> {
    return this.client.eval<T>(script, options);
  }

  scanIterator(options: { MATCH: string; COUNT?: number }): AsyncIterable<string> {
    return this.client.scanIterator(options);
  }

  ping(): Promise<string> {
    return this.client.ping();
  }
}

class RedisCliClient implements RedisClientLike {
  constructor(private readonly url: string) {}

  async get(key: string): Promise<string | null> {
    const out = await this.exec(['GET', key]);
    if (!out || out === '(nil)') {
      return null;
    }
    return out;
  }

  async set(key: string, value: string, options: { PX: number; NX?: boolean }): Promise<string | null> {
    const args = ['SET', key, value, 'PX', String(options.PX)];
    if (options.NX) args.push('NX');
    const out = await this.exec(args);
    if (out === '(nil)') {
      return null;
    }
    return out;
  }

  async del(key: string | string[]): Promise<number> {
    const keys = Array.isArray(key) ? key : [key];
    /* istanbul ignore next */
    if (!keys.length) return 0;
    const out = await this.exec(['DEL', ...keys]);
    return Number(out);
  }

  async eval<T = unknown>(script: string, options: { keys?: string[]; arguments?: (string | number)[] }): Promise<T> {
    const keys = options.keys ?? [];
    const args = options.arguments ?? [];
    const command = ['EVAL', script, String(keys.length), ...keys, ...args.map((a) => String(a))];
    const out = await this.exec(command);
    if (out === '(nil)' || out === '') {
      return null as unknown as T;
    }
    if (/^-?\d+$/.test(out)) {
      return Number(out) as unknown as T;
    }
    try {
      return JSON.parse(out) as T;
    } catch {
      return out as unknown as T;
    }
  }

  async *scanIterator(options: { MATCH: string; COUNT?: number }): AsyncIterable<string> {
    let cursor = '0';
    const countArg = options.COUNT ? ['COUNT', String(options.COUNT)] : [];
    do {
      const raw = await this.exec(['SCAN', cursor, 'MATCH', options.MATCH, ...countArg]);
      const lines = raw.split('\n').filter((line) => line.length);
      if (!lines.length) {
        cursor = '0';
        return;
      }
      cursor = lines[0];
      for (let i = 1; i < lines.length; i += 1) {
        yield lines[i];
      }
    } while (cursor !== '0');
  }

  ping(): Promise<string> {
    return this.exec(['PING']);
  }

  private async exec(args: string[]): Promise<string> {
    const { stdout } = await execFileAsync('redis-cli', ['-u', this.url, '--raw', ...args], {
      encoding: 'utf8',
    });
    return stdout.trim();
  }
}

export type RedisProbeMode = 'node-redis' | 'redis-cli' | 'none';

export interface RedisProbeResult {
  ok: boolean;
  mode: RedisProbeMode;
  error?: string;
  permissionDenied?: boolean;
}

function isPermissionDenied(text: string | undefined): boolean {
  /* istanbul ignore next */
  if (!text) return false;
  return /operation not permitted|eperm/i.test(text);
}

export function probeRedis(url: string): RedisProbeResult {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('redis');
    return { ok: true, mode: 'node-redis' };
  } catch (nodeRedisErr) {
    try {
      const ping = spawnSync('redis-cli', ['-u', url, 'PING'], { encoding: 'utf8' });
      if (ping.status === 0) {
        return { ok: true, mode: 'redis-cli' };
      }
      const detail = (ping.stderr || ping.stdout || '').trim();
      return { ok: false, mode: 'none', error: detail || String(nodeRedisErr), permissionDenied: isPermissionDenied(detail) };
    } catch (cliErr: any) {
      const detail = cliErr?.message ?? String(cliErr);
      return { ok: false, mode: 'none', error: detail, permissionDenied: isPermissionDenied(detail) };
    }
  }
}

export function createRedisClient(url: string): RedisClientLike | undefined {
  const probe = probeRedis(url);
  if (!probe.ok) {
    if (probe.permissionDenied) {
      redisLog('warn', '[OIDC4VCI] Redis access denied; reverting to in-memory store', {
        mode: probe.mode,
        error: probe.error,
      });
    } else if (probe.error) {
      redisLog('debug', '[OIDC4VCI] Redis probe failed', { error: probe.error });
    }
    return undefined;
  }

  if (probe.mode === 'redis-cli') {
    /* istanbul ignore next */
    redisLog('debug', '[OIDC4VCI] Using redis-cli client for OIDC4VCI store');
    return new RedisCliClient(url);
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { createClient } = require('redis') as { createClient: (options: { url: string }) => NodeRedisClient };
    const client = createClient({ url });
    /* istanbul ignore next */
    if (typeof client.on === 'function') {
      client.on('error', (err: unknown) => {
        redisLog('debug', '[OIDC4VCI] Redis client error', { error: err instanceof Error ? err.message : err });
      });
    }
    /* istanbul ignore next */
    if (typeof client.connect === 'function' && !client.isOpen) {
      client
        .connect()
        .catch((err: unknown) =>
          redisLog('debug', '[OIDC4VCI] Redis connect failed; client will retry internally', {
            error: err instanceof Error ? err.message : err,
          })
        );
    }
    /* istanbul ignore next */
    redisLog('debug', '[OIDC4VCI] Using node-redis client for OIDC4VCI store');
    return new RedisModuleAdapter(client);
  } catch (err) {
    redisLog('debug', '[OIDC4VCI] Unable to initialize node-redis client; attempting redis-cli', {
      error: err instanceof Error ? err.message : err,
    });
    const cliProbe = spawnSync('redis-cli', ['-u', url, 'PING'], { encoding: 'utf8' });
    /* istanbul ignore next */
    if (cliProbe.status === 0) {
      /* istanbul ignore next */
    redisLog('debug', '[OIDC4VCI] Using redis-cli client after node-redis failure');
      return new RedisCliClient(url);
    }
    const detail = (cliProbe.stderr || cliProbe.stdout || '').trim();
    const permissionDenied = isPermissionDenied(detail);
    /* istanbul ignore next */
    redisLog(permissionDenied ? 'warn' : 'debug', '[OIDC4VCI] redis-cli unavailable; reverting to in-memory store', {
      error: detail || (err instanceof Error ? err.message : err),
      permissionDenied,
    });
    return undefined;
  }
}

export const probe = probeRedis;
