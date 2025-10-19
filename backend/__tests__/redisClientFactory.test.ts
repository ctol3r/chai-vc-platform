import type { RedisClientLike } from '../src/services/preAuthorizedCodeStore';

describe('redisClientFactory', () => {
  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    delete process.env.LOG_LEVEL;
  });

  function loadFactory(): {
    createRedisClient: (url: string) => RedisClientLike | undefined;
    probeRedis: (url: string) => { ok: boolean; mode: string; error?: string; permissionDenied?: boolean };
    probe: (url: string) => { ok: boolean; mode: string; error?: string; permissionDenied?: boolean };
    redisLog: (level: string, message: string, meta?: Record<string, unknown>) => void;
  } {
    let factory:
      | {
          createRedisClient: (url: string) => RedisClientLike | undefined;
          probeRedis: (url: string) => { ok: boolean; mode: string; error?: string; permissionDenied?: boolean };
          probe: (url: string) => { ok: boolean; mode: string; error?: string; permissionDenied?: boolean };
          redisLog: (level: string, message: string, meta?: Record<string, unknown>) => void;
        }
      | undefined;
    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      factory = require('../src/services/redisClientFactory');
    });
    if (!factory) {
      throw new Error('failed to load factory');
    }
    return factory;
  }

  it('returns redis module adapter when node-redis is available', async () => {
    const get = jest.fn().mockResolvedValue('value');
    const set = jest.fn().mockResolvedValue('OK');
    const del = jest.fn().mockResolvedValue(1);
    const evalFn = jest.fn().mockResolvedValue({ status: 'ok' });
    const asyncIter = async function* () {
      yield 'key-1';
    };
    const scanIterator = jest.fn().mockReturnValue(asyncIter());
    const ping = jest.fn().mockResolvedValue('PONG');

    jest.doMock('redis', () => ({
      createClient: () => ({
        get,
        set,
        del,
        eval: evalFn,
        scanIterator,
        ping,
        connect: jest.fn().mockResolvedValue(undefined),
        isOpen: false,
        on: jest.fn(),
      }),
    }), { virtual: true });

    jest.doMock('child_process', () => ({
      execFile: jest.fn(),
      spawnSync: jest.fn(() => ({ status: 0, stdout: 'PONG', stderr: '' })),
    }));

    process.env.LOG_LEVEL = 'error';
    const { createRedisClient, probeRedis, probe } = loadFactory();

    expect(probeRedis('redis://localhost:6379')).toEqual({ ok: true, mode: 'node-redis' });
    expect(probe('redis://localhost:6379')).toEqual({ ok: true, mode: 'node-redis' });

    const client = createRedisClient('redis://localhost:6379');
    expect(client).toBeDefined();
    await client!.get('foo');
    expect(get).toHaveBeenCalledWith('foo');
    await client!.set('foo', 'bar', { PX: 1000 });
    expect(set).toHaveBeenCalled();
    await client!.del('foo');
    expect(del).toHaveBeenCalled();
    await client!.eval('return 1', { keys: [], arguments: [] });
    expect(evalFn).toHaveBeenCalled();
    const keys: string[] = [];
    for await (const key of client!.scanIterator({ MATCH: 'key:*' })) {
      keys.push(key);
    }
    expect(keys).toEqual(['key-1']);
    await client!.ping();
    expect(ping).toHaveBeenCalled();
  });

  it('handles node-redis client without optional hooks', async () => {
    jest.doMock('redis', () => ({
      createClient: () => ({
        get: jest.fn().mockResolvedValue(null),
        set: jest.fn().mockResolvedValue('OK'),
        del: jest.fn().mockResolvedValue(0),
        eval: jest.fn().mockResolvedValue('result'),
        scanIterator: jest.fn().mockReturnValue((async function* () {})()),
        ping: jest.fn().mockResolvedValue('PONG'),
        isOpen: true,
      }),
    }), { virtual: true });

    jest.doMock('child_process', () => ({
      execFile: jest.fn(),
      spawnSync: jest.fn(() => ({ status: 0, stdout: 'PONG', stderr: '' })),
    }));

    const { createRedisClient } = loadFactory();
    const client = createRedisClient('redis://localhost:6379');
    expect(client).toBeDefined();
  });

  it('falls back to redis-cli when node-redis is unavailable', async () => {
    let setInvocations = 0;
    const execFileMock = jest.fn((file: string, args: string[], options: any, callback: any) => {
      const redisArgs = args.slice(3);
      const command = redisArgs[0];
      let stdout = '';
      switch (command) {
        case 'GET':
          stdout = redisArgs[1] === 'missing' ? '(nil)\n' : 'value\n';
          break;
        case 'SET':
          setInvocations += 1;
          stdout = setInvocations === 1 ? 'OK\n' : '(nil)\n';
          break;
        case 'DEL':
          stdout = '1\n';
          break;
        case 'EVAL':
          if (redisArgs[1] === 'numeric-script') {
            stdout = '1\n';
          } else if (redisArgs[1] === 'json-script') {
            stdout = '{"status":"ok"}\n';
          } else if (redisArgs[1] === 'nil-script') {
            stdout = '(nil)\n';
          } else {
            stdout = 'raw-value\n';
          }
          break;
        case 'SCAN':
          stdout = redisArgs.includes('empty-*') ? '\n' : '0\nkey-a\nkey-b\n';
          break;
        case 'PING':
          stdout = 'PONG\n';
          break;
        default:
          stdout = '\n';
      }
      callback(null, { stdout, stderr: '' });
    });

    const spawnSyncMock = jest.fn(() => ({ status: 0, stdout: 'PONG\n', stderr: '' }));

    jest.doMock('child_process', () => ({
      execFile: execFileMock,
      spawnSync: spawnSyncMock,
    }));

    jest.doMock('redis', () => {
      throw new Error('module not found');
    }, { virtual: true });

    process.env.LOG_LEVEL = 'error';
    const { createRedisClient, probeRedis } = loadFactory();
    expect(probeRedis('redis://localhost:6379')).toEqual({ ok: true, mode: 'redis-cli' });

    const client = createRedisClient('redis://localhost:6379');
    expect(spawnSyncMock).toHaveBeenCalled();
    await expect(client!.get('foo')).resolves.toBe('value');
    await expect(client!.get('missing')).resolves.toBeNull();
    await expect(client!.set('foo', 'bar', { PX: 1000, NX: true })).resolves.toBe('OK');
    await expect(client!.set('foo', 'bar', { PX: 1000, NX: true })).resolves.toBeNull();
    await expect(client!.del(['foo'])).resolves.toBe(1);
    await expect(client!.del([])).resolves.toBe(0);
    await expect(client!.eval('numeric-script', { keys: [], arguments: [] })).resolves.toBe(1);
    await expect(client!.eval('json-script', { keys: [], arguments: [] })).resolves.toEqual({ status: 'ok' });
    await expect(client!.eval('nil-script', { keys: [], arguments: [] })).resolves.toBeNull();
    await expect(client!.eval('raw-script', { keys: [], arguments: [] })).resolves.toBe('raw-value');
    const yielded: string[] = [];
    for await (const key of client!.scanIterator({ MATCH: 'key-*', COUNT: 5 })) {
      yielded.push(key);
    }
    expect(yielded).toEqual(['key-a', 'key-b']);
    const empty: string[] = [];
    for await (const key of client!.scanIterator({ MATCH: 'empty-*' })) {
      empty.push(key);
    }
    expect(empty).toHaveLength(0);
    await expect(client!.ping()).resolves.toBe('PONG');
  });

  it('returns undefined when redis-cli ping fails', () => {
    jest.doMock('child_process', () => ({
      execFile: jest.fn((file: string, args: string[], options: any, callback: any) => callback(null, { stdout: '', stderr: '' })),
      spawnSync: jest.fn(() => ({ status: 1, stdout: '', stderr: 'error' })),
    }));

    jest.doMock('redis', () => {
      throw new Error('module not found');
    }, { virtual: true });

    process.env.LOG_LEVEL = 'error';
    const { createRedisClient, probeRedis } = loadFactory();
    const probeResult = probeRedis('redis://localhost:6379');
    expect(probeResult.ok).toBe(false);
    expect(probeResult.mode).toBe('none');
    expect(createRedisClient('redis://localhost:6379')).toBeUndefined();
  });

  it('flags permission denied during probe', () => {
    process.env.LOG_LEVEL = 'error';
    jest.doMock('child_process', () => ({
      execFile: jest.fn(),
      spawnSync: jest.fn(() => ({ status: 1, stdout: '', stderr: 'EPERM: Operation not permitted' })),
    }));
    jest.doMock('redis', () => {
      throw new Error('module not found');
    }, { virtual: true });
    const { probeRedis } = loadFactory();
    const result = probeRedis('redis://localhost:6379');
    expect(result.ok).toBe(false);
    expect(result.permissionDenied).toBe(true);
  });

  it('handles spawnSync exceptions during probe', () => {
    process.env.LOG_LEVEL = 'error';
    jest.doMock('child_process', () => ({
      execFile: jest.fn(),
      spawnSync: jest.fn(() => {
        throw new Error('spawn failure');
      }),
    }));
    jest.doMock('redis', () => {
      throw new Error('module not found');
    }, { virtual: true });
    const { probeRedis } = loadFactory();
    const result = probeRedis('redis://localhost:6379');
    expect(result.ok).toBe(false);
    expect(result.mode).toBe('none');
    expect(result.error).toContain('spawn failure');
  });

  it('suppresses warnings when LOG_LEVEL=error on non-permission failure', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    process.env.LOG_LEVEL = 'error';
    jest.doMock('child_process', () => ({
      execFile: jest.fn(),
      spawnSync: jest.fn(() => ({ status: 1, stdout: '', stderr: 'connection refused' })),
    }));
    jest.doMock('redis', () => {
      throw new Error('module not found');
    }, { virtual: true });
    const { createRedisClient } = loadFactory();
    expect(createRedisClient('redis://localhost:6379')).toBeUndefined();
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it('warns once when permission denied during fallback', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    process.env.LOG_LEVEL = 'warn';
    jest.doMock('child_process', () => ({
      execFile: jest.fn(),
      spawnSync: jest.fn(() => ({ status: 1, stdout: '', stderr: 'Operation not permitted' })),
    }));
    jest.doMock('redis', () => {
      throw new Error('module not found');
    }, { virtual: true });
    const { createRedisClient } = loadFactory();
    expect(createRedisClient('redis://localhost:6379')).toBeUndefined();
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toContain('Redis access denied');
    warn.mockRestore();
  });

  it('handles redis-cli failure with stdout detail', () => {
    jest.doMock('child_process', () => ({
      execFile: jest.fn(),
      spawnSync: jest.fn(() => ({ status: 1, stdout: 'fail message', stderr: '' })),
    }));
    jest.doMock('redis', () => {
      throw new Error('module not found');
    }, { virtual: true });
    const { probeRedis } = loadFactory();
    const res = probeRedis('redis://localhost:6379');
    expect(res).toEqual({ ok: false, mode: 'none', error: 'fail message', permissionDenied: false });
  });

  it('handles redis-cli failure with empty output', () => {
    jest.doMock('child_process', () => ({
      execFile: jest.fn(),
      spawnSync: jest.fn(() => ({ status: 1, stdout: '', stderr: '' })),
    }));
    jest.doMock('redis', () => {
      throw new Error('module not found');
    }, { virtual: true });
    const { probeRedis } = loadFactory();
    const res = probeRedis('redis://localhost:6379');
    expect(res).toEqual({ ok: false, mode: 'none', error: 'Error: module not found', permissionDenied: false });
  });

  it('handles node-redis create failure followed by redis-cli failure', () => {
    process.env.LOG_LEVEL = 'debug';
    jest.doMock('child_process', () => ({
      execFile: jest.fn(),
      spawnSync: jest.fn(() => ({ status: 1, stdout: '', stderr: 'connection refused' })),
    }));
    jest.doMock('redis', () => ({
      createClient: () => {
        throw new Error('client failure');
      },
    }), { virtual: true });
    const { createRedisClient } = loadFactory();
    expect(createRedisClient('redis://localhost:6379')).toBeUndefined();
  });

  it('respects LOG_LEVEL thresholds for redisLog', () => {
    const debug = jest.spyOn(console, 'debug').mockImplementation(() => {});
    const info = jest.spyOn(console, 'info').mockImplementation(() => {});
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const error = jest.spyOn(console, 'error').mockImplementation(() => {});
    const { redisLog } = loadFactory();

    process.env.LOG_LEVEL = 'debug';
    redisLog('debug', 'dbg');
    expect(debug).toHaveBeenCalledWith('dbg');
    redisLog('info', 'inf', { foo: 'bar' });
    expect(info).toHaveBeenCalledWith('inf {"foo":"bar"}');

    process.env.LOG_LEVEL = 'warn';
    redisLog('info', 'ignored');
    expect(info).toHaveBeenCalledTimes(1);
    redisLog('warn', 'warned');
    expect(warn).toHaveBeenCalledWith('warned');
    redisLog('error', 'errored');
    expect(error).toHaveBeenCalledWith('errored');

    process.env.LOG_LEVEL = 'invalid';
    redisLog('info', 'fallback');
    expect(info).toHaveBeenCalledTimes(2);

    debug.mockRestore();
    info.mockRestore();
    warn.mockRestore();
    error.mockRestore();
  });
});
