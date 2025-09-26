import http, { type RequestOptions } from 'http';
import https from 'https';
import { URL } from 'url';

export interface PrivacyVerificationRequest {
  credential: Record<string, unknown>;
  proof: Record<string, unknown>;
}

export interface PrivacyVerificationResponse {
  valid: boolean;
  checkedAt: string;
  reason?: string;
  details?: Record<string, unknown>;
}

export interface PrivacyClientLike {
  verifyProof(payload: PrivacyVerificationRequest, timeoutMs?: number): Promise<PrivacyVerificationResponse>;
}

const DEFAULT_TIMEOUT_MS = 2000;
const DEFAULT_BASE_URL = 'http://localhost:5050';

export class HttpPrivacyClient implements PrivacyClientLike {
  constructor(private readonly baseUrl: string = process.env.PRIVACY_SERVICE_URL ?? DEFAULT_BASE_URL) {}

  async verifyProof(
    payload: PrivacyVerificationRequest,
    timeoutMs: number = DEFAULT_TIMEOUT_MS,
  ): Promise<PrivacyVerificationResponse> {
    const url = new URL('/verify', this.baseUrl);
    const body = JSON.stringify(payload);
    const isHttps = url.protocol === 'https:';
    const transport = isHttps ? https : http;

    const options: RequestOptions = {
      method: 'POST',
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    };

    return new Promise<PrivacyVerificationResponse>((resolve, reject) => {
      const req = transport.request(options, (res) => {
        const chunks: Buffer[] = [];
        res.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
        res.on('end', () => {
          try {
            const responseBody = Buffer.concat(chunks).toString('utf-8');
            const parsed = JSON.parse(responseBody) as PrivacyVerificationResponse;
            if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
              resolve(parsed);
            } else {
              reject(new Error(parsed.reason || `privacy-service-error-${res.statusCode}`));
            }
          } catch (error) {
            reject(error);
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.setTimeout(timeoutMs, () => {
        req.destroy(new Error('privacy-service-timeout'));
      });

      req.write(body);
      req.end();
    });
  }
}

export class DevPrivacyClient implements PrivacyClientLike {
  async verifyProof(payload: PrivacyVerificationRequest): Promise<PrivacyVerificationResponse> {
    return {
      valid: true,
      checkedAt: new Date().toISOString(),
      details: {
        strategy: 'dev-stub',
        credentialPreview: payload.credential,
      },
    };
  }
}

const createClient = (): PrivacyClientLike => {
  if ((process.env.PRIVACY_CLIENT_MODE ?? '').toLowerCase() === 'dev') {
    return new DevPrivacyClient();
  }
  return new HttpPrivacyClient();
};

export const privacyClient: PrivacyClientLike = createClient();
