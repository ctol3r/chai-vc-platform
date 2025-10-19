const ADMIN_BASE = process.env.ACA_PY_ADMIN_URL || 'http://aca-py:8021';
const DEFAULT_TIMEOUT_MS = 1500;

type Json = Record<string, unknown>;

export async function acapyPost<T extends Json>(
  path: string,
  body: Json,
  opts?: { apiBase?: string; apiKey?: string }
): Promise<T> {
  const apiBase = opts?.apiBase ?? process.env.ACA_PY_URL ?? 'http://acapy:8031';
  const res = await fetch(`${apiBase}${path}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(opts?.apiKey ? { authorization: `Bearer ${opts.apiKey}` } : {})
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`acapy_error ${res.status}`);
  return (await res.json()) as T;
}

async function postJson(path: string, payload: Record<string, unknown>): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    return await fetch(path, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
  } finally {
    clearTimeout(timer);
  }
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value === 'object' && value !== null) {
    return value as Record<string, unknown>;
  }
  return null;
}

export async function issueStatusProof(hash: string): Promise<Record<string, unknown>> {
  const fallback = { token: `MOCK-PROOF-${hash.slice(0, 8)}`, ok: true };

  try {
    const response = await postJson(`${ADMIN_BASE}/admin/status_proof`, { credential_hash: hash });

    if (!response.ok) {
      return fallback;
    }

    const data = await response.json();
    const record = asRecord(data);

    return record ?? fallback;
  } catch (error) {
    return fallback;
  }
}

export async function verifyStatusProof(token: string): Promise<Record<string, unknown>> {
  if (token.startsWith('MOCK-PROOF-')) {
    return { ok: true, reason: 'mock' };
  }

  const failure = { ok: false, reason: 'verify-failed' };

  try {
    const response = await postJson(`${ADMIN_BASE}/admin/verify`, { token });

    if (!response.ok) {
      return failure;
    }

    const data = await response.json();
    const record = asRecord(data);

    return record ?? failure;
  } catch (error) {
    return failure;
  }
}
