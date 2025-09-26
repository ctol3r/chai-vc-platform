import { Request, Response, NextFunction } from 'express';

// naive redactor - improve with a proper library if needed
const SECRET_KEYS = ['password','secret','token','apikey','authorization','auth','iv','payloadenc'];

export function redact(obj: any): any {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(redact);
  const out: any = {};
  for (const [k,v] of Object.entries(obj)) {
    if (SECRET_KEYS.includes(k.toLowerCase())) { out[k] = '[redacted]'; }
    else { out[k] = redact(v); }
  }
  return out;
}

export function redactLogs(req: Request, _res: Response, next: NextFunction) {
  try {
    const body = (req as any).body ? redact((req as any).body) : undefined;
    const q = req.query ? redact(req.query) : undefined;
    (req as any).__safeLog = { method: req.method, url: req.url, body, q };
  } catch { /* ignore */ }
  next();
}
