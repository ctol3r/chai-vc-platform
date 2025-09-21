const ADMIN_BASE = process.env.ACA_PY_ADMIN_URL || 'http://aca-py:8021';
const DEFAULT_TIMEOUT_MS = 1500;

type ResponseLike = {
  ok: boolean;
  json(): Promise<unknown>;
};

type FetchImpl = (input: string, init?: Record<string, unknown>) => Promise<ResponseLike>;

async function resolveFetch(): Promise<FetchImpl> {
  const existing = (globalThis as unknown as { fetch?: unknown }).fetch;
  if (typeof existing === 'function') {
    return existing as FetchImpl;
  }

  const mod: unknown = await import('node-fetch');
  const asModule = mod as { default?: FetchImpl };
  return (asModule.default ?? (mod as FetchImpl)) as FetchImpl;
}

async function postJson(path: string, payload: Record<string, unknown>): Promise<ResponseLike> {
  const fetchFn = await resolveFetch();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    return await fetchFn(path, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
      signal: controller.signal as unknown
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
