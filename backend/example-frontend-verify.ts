// Frontend verification utility
// Place in: frontend/lib/verify.ts or similar

interface VerifyResponse {
  valid: boolean;
  reason?: string;
  auditRef?: string;
  credentialSubject?: {
    id: string;
    name?: string;
    licenseNumber?: string;
    licenseState?: string;
    specialty?: string;
    [key: string]: any;
  };
}

export const verify = async (jwt: string): Promise<VerifyResponse> => {
  const ctrl = new AbortController();
  const timeout = setTimeout(() => ctrl.abort(), 5000);

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/verifier/presentation`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ jwt }),
      signal: ctrl.signal
    });

    if (!res.ok) {
      throw new Error(`verify_failed_${res.status}`);
    }

    return await res.json();
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('verify_timeout');
      }
      throw error;
    }
    throw new Error('verify_unknown_error');
  } finally {
    clearTimeout(timeout);
  }
};

// Usage example:
/*
import { verify } from '@/lib/verify';

try {
  const result = await verify(jwtToken);
  if (result.valid) {
    console.log('Credential valid!', result.credentialSubject);
  } else {
    console.error('Credential invalid:', result.reason);
  }
} catch (error) {
  console.error('Verification failed:', error);
}
*/
