import { Request, Response, NextFunction } from 'express';

const SECRET_KEYS = new Set([
  'password',
  'secret',
  'token',
  'apikey',
  'authorization',
  'auth',
  'iv',
  'payloadenc',
]);

type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonArray | JsonObject;
type JsonArray = JsonValue[];
type JsonObject = { [key: string]: JsonValue };

type SafeLogPayload = {
  method: string;
  url: string;
  body?: unknown;
  q?: unknown;
};

interface RequestWithSafeLog extends Request {
  __safeLog?: SafeLogPayload;
}

const isPlainObject = (value: unknown): value is JsonObject =>
  Object.prototype.toString.call(value) === '[object Object]';

export const redact = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return (value as JsonArray).map((item) => redact(item)) as JsonArray;
  }

  if (isPlainObject(value)) {
    const entries = Object.entries(value).map(([key, entryValue]) => {
      if (SECRET_KEYS.has(key.toLowerCase())) {
        return [key, '[redacted]'];
      }
      return [key, redact(entryValue)];
    });

    return Object.fromEntries(entries) as JsonObject;
  }

  return value;
};

export const redactLogs = (req: Request, _res: Response, next: NextFunction): void => {
  const requestWithSafeLog = req as RequestWithSafeLog;
  try {
    const body = typeof req.body === 'undefined' ? undefined : redact(req.body);
    const query = req.query ? redact(req.query) : undefined;
    requestWithSafeLog.__safeLog = { method: req.method, url: req.url, body, q: query };
  } catch {
    requestWithSafeLog.__safeLog = { method: req.method, url: req.url };
  }
  next();
};
