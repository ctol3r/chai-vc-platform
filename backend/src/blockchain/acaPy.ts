import fetch from 'node-fetch';

const ACA_PY_BASE_URL = process.env.ACA_PY_ADMIN_URL ?? 'http://localhost:8021';
const ISSUE_PATH = '/status-proof';
const VERIFY_PATH = '/status-proof/verify';

export type IssueStatusProofResponse = {
  proofToken: string;
  presentation?: unknown;
  mock?: boolean;
};

export type VerifyStatusProofResponse = {
  ok: boolean;
  reason?: string;
};

async function callAcaPy(path: string, init?: RequestInit) {
  const url = `${ACA_PY_BASE_URL}${path}`;
  try {
    const response = await fetch(url, init);
    if (!response.ok) {
      throw new Error(`ACA-Py request failed: ${response.status} ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    console.warn('ACA-Py request failed, falling back to mock payload', error);
    return null;
  }
}

function mockTokenForHash(credentialHash: string): string {
  const sanitized = credentialHash.replace(/^0x/i, '').slice(0, 8).padEnd(8, '0').toUpperCase();
  return `MOCK-PROOF-${sanitized}`;
}

export async function issueStatusProof(credentialHash: string): Promise<IssueStatusProofResponse> {
  const result = await callAcaPy(ISSUE_PATH, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ credential_hash: credentialHash }),
  });

  if (result) {
    const token = result.token ?? result.proofToken ?? result.thread_id ?? result.id;
    return {
      proofToken: token ?? mockTokenForHash(credentialHash),
      presentation: result.presentation ?? result,
      mock: false,
    };
  }

  return {
    proofToken: mockTokenForHash(credentialHash),
    presentation: { hash: credentialHash, issuedAt: Date.now() },
    mock: true,
  };
}

export async function verifyStatusProof(token: string): Promise<VerifyStatusProofResponse> {
  const result = await callAcaPy(VERIFY_PATH, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });

  if (!result) {
    if (token.startsWith('MOCK-PROOF-')) {
      return { ok: true, reason: 'mock verification' };
    }
    return { ok: false, reason: 'ACA-Py unavailable and token is not a recognised mock proof' };
  }

  const ok = Boolean(result.valid ?? result.success ?? result.ok ?? false);
  return {
    ok,
    reason: ok ? result.reason ?? result.message : result.error ?? result.reason,
  };
}
