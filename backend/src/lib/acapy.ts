import fetch from 'node-fetch';
import https from 'https';

/**
 * ACA-Py (Aries Cloud Agent - Python) Client
 * Secure client with retries, circuit-breaker, and observability
 */

export interface ACAPayConfig {
  baseUrl: string;
  apiKey?: string;
  useTLS?: boolean;
  rejectUnauthorized?: boolean;
  timeout?: number;
  maxRetries?: number;
  retryDelay?: number;
}

interface CircuitBreakerState {
  failures: number;
  lastFailureTime: number;
  state: 'closed' | 'open' | 'half-open';
}

export interface CredentialDefinition {
  credDefId: string;
  schemaId: string;
  tag: string;
}

export interface IssueCredentialRequest {
  connectionId: string;
  credDefId: string;
  attributes: Array<{ name: string; value: string }>;
  comment?: string;
}

export interface CredentialExchangeRecord {
  credentialExchangeId: string;
  state: string;
  connectionId: string;
  credDefId: string;
  threadId?: string;
}

export interface WebhookEvent {
  topic: string;
  payload: any;
  timestamp: string;
}

/**
 * ACA-Py Client
 */
export class ACAPayClient {
  private baseUrl: string;
  private apiKey?: string;
  private agent: https.Agent | undefined;
  private timeout: number;
  private maxRetries: number;
  private retryDelay: number;
  private circuitBreaker: CircuitBreakerState;

  constructor(config: ACAPayConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.apiKey = config.apiKey;
    this.timeout = config.timeout || 10000; // 10 seconds default
    this.maxRetries = config.maxRetries || 3;
    this.retryDelay = config.retryDelay || 1000; // 1 second

    // Circuit breaker state
    this.circuitBreaker = {
      failures: 0,
      lastFailureTime: 0,
      state: 'closed',
    };

    // Configure HTTPS agent for TLS
    if (config.useTLS) {
      this.agent = new https.Agent({
        rejectUnauthorized: config.rejectUnauthorized !== false,
      });
    }
  }

  /**
   * Check circuit breaker state
   */
  private checkCircuitBreaker(): void {
    const now = Date.now();
    const resetTime = 60000; // 1 minute

    if (this.circuitBreaker.state === 'open') {
      // Check if enough time has passed to try half-open
      if (now - this.circuitBreaker.lastFailureTime > resetTime) {
        this.circuitBreaker.state = 'half-open';
        this.circuitBreaker.failures = 0;
      } else {
        throw new Error('Circuit breaker is OPEN - ACA-Py unavailable');
      }
    }
  }

  /**
   * Record success/failure for circuit breaker
   */
  private recordResult(success: boolean): void {
    if (success) {
      if (this.circuitBreaker.state === 'half-open') {
        // Success in half-open, close the circuit
        this.circuitBreaker.state = 'closed';
      }
      this.circuitBreaker.failures = 0;
    } else {
      this.circuitBreaker.failures++;
      this.circuitBreaker.lastFailureTime = Date.now();

      // Open circuit after 5 consecutive failures
      if (this.circuitBreaker.failures >= 5) {
        this.circuitBreaker.state = 'open';
        console.error('Circuit breaker OPENED for ACA-Py');
      }
    }
  }

  /**
   * Sleep for retry delay
   */
  private async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Make an authenticated request to ACA-Py with retries and circuit breaker
   */
  private async request(
    method: string,
    path: string,
    body?: any
  ): Promise<any> {
    // Check circuit breaker
    this.checkCircuitBreaker();

    const url = `${this.baseUrl}${path}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.apiKey) {
      headers['X-API-Key'] = this.apiKey;
    }

    const options: any = {
      method,
      headers,
      agent: this.agent,
      timeout: this.timeout,
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    // Retry logic
    let lastError: Error | null = null;
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const startTime = Date.now();
        const response = await fetch(url, options);
        const latency = Date.now() - startTime;

        // Log slow requests
        if (latency > 5000) {
          console.warn(`Slow ACA-Py request: ${method} ${path} took ${latency}ms`);
        }

        if (!response.ok) {
          const error = await response.text();
          throw new Error(`ACA-Py request failed: ${response.status} - ${error}`);
        }

        const result = await response.json();

        // Record success
        this.recordResult(true);

        return result;
      } catch (err: any) {
        lastError = err;

        // Don't retry on client errors (4xx)
        if (err.message && err.message.includes('400')) {
          this.recordResult(false);
          throw err;
        }

        // Retry on network/server errors
        if (attempt < this.maxRetries) {
          const delay = this.retryDelay * Math.pow(2, attempt); // Exponential backoff
          console.warn(
            `ACA-Py request failed (attempt ${attempt + 1}/${this.maxRetries + 1}), retrying in ${delay}ms:`,
            err.message
          );
          await this.sleep(delay);
        }
      }
    }

    // All retries exhausted
    this.recordResult(false);
    throw new Error(
      `ACA-Py connection error after ${this.maxRetries + 1} attempts: ${lastError?.message}`
    );
  }

  /**
   * Get agent status
   */
  async getStatus(): Promise<any> {
    return this.request('GET', '/status');
  }

  /**
   * Issue a credential
   */
  async issueCredential(
    request: IssueCredentialRequest
  ): Promise<CredentialExchangeRecord> {
    const body = {
      connection_id: request.connectionId,
      cred_def_id: request.credDefId,
      credential_preview: {
        '@type': 'https://didcomm.org/issue-credential/2.0/credential-preview',
        attributes: request.attributes,
      },
      comment: request.comment || 'VitalCV Credential',
      auto_issue: true,
      auto_remove: false,
      trace: false,
    };

    const result = await this.request(
      'POST',
      '/issue-credential-2.0/send',
      body
    );

    return {
      credentialExchangeId: result.cred_ex_id || result.credential_exchange_id,
      state: result.state,
      connectionId: result.connection_id,
      credDefId: result.cred_def_id,
      threadId: result.thread_id,
    };
  }

  /**
   * Get credential exchange record
   */
  async getCredentialExchange(
    credExId: string
  ): Promise<CredentialExchangeRecord> {
    const result = await this.request(
      'GET',
      `/issue-credential-2.0/records/${credExId}`
    );

    return {
      credentialExchangeId: result.cred_ex_id || result.credential_exchange_id,
      state: result.state,
      connectionId: result.connection_id,
      credDefId: result.cred_def_id,
      threadId: result.thread_id,
    };
  }

  /**
   * Create a connection invitation
   */
  async createInvitation(alias?: string): Promise<any> {
    const body = alias ? { alias } : {};
    return this.request('POST', '/connections/create-invitation', body);
  }

  /**
   * Get connection by ID
   */
  async getConnection(connectionId: string): Promise<any> {
    return this.request('GET', `/connections/${connectionId}`);
  }

  /**
   * List credential definitions
   */
  async listCredentialDefinitions(): Promise<CredentialDefinition[]> {
    const result = await this.request('GET', '/credential-definitions/created');
    
    return (result.credential_definition_ids || []).map((id: string) => ({
      credDefId: id,
      schemaId: '', // Would need additional lookup
      tag: '',
    }));
  }
}

/**
 * Get configured ACA-Py client (singleton)
 */
export function getACAPayClient(): ACAPayClient {
  const config: ACAPayConfig = {
    baseUrl: process.env.ACAPY_URL || 'http://localhost:8031',
    apiKey: process.env.ACAPY_API_KEY,
    useTLS: process.env.ACAPY_USE_TLS === 'true',
    rejectUnauthorized: process.env.ACAPY_REJECT_UNAUTHORIZED !== 'false',
  };

  return new ACAPayClient(config);
}

/**
 * ACA-Py Stub for local development
 */
export class ACAPayStub extends ACAPayClient {
  private mockRecords: Map<string, any> = new Map();

  constructor() {
    super({ baseUrl: 'http://localhost:stub' });
  }

  async getStatus(): Promise<any> {
    return {
      version: '0.7.5-stub',
      label: 'VitalCV ACA-Py Stub',
    };
  }

  async issueCredential(
    request: IssueCredentialRequest
  ): Promise<CredentialExchangeRecord> {
    const credExId = `stub-${Date.now()}`;
    const record = {
      credentialExchangeId: credExId,
      state: 'credential-issued',
      connectionId: request.connectionId,
      credDefId: request.credDefId,
      threadId: `thread-${credExId}`,
      attributes: request.attributes,
    };

    this.mockRecords.set(credExId, record);

    // Simulate async issuance
    setTimeout(() => {
      const r = this.mockRecords.get(credExId);
      if (r) {
        r.state = 'done';
      }
    }, 2000);

    return record;
  }

  async getCredentialExchange(
    credExId: string
  ): Promise<CredentialExchangeRecord> {
    const record = this.mockRecords.get(credExId);
    if (!record) {
      throw new Error(`Credential exchange ${credExId} not found`);
    }
    return record;
  }

  async createInvitation(alias?: string): Promise<any> {
    return {
      connection_id: `stub-conn-${Date.now()}`,
      invitation: {
        '@id': `stub-invitation-${Date.now()}`,
        '@type': 'https://didcomm.org/connections/1.0/invitation',
        label: alias || 'VitalCV Stub',
        serviceEndpoint: 'http://localhost:8031',
      },
      invitation_url: 'http://localhost:8031?c_i=stub',
    };
  }

  async getConnection(connectionId: string): Promise<any> {
    return {
      connection_id: connectionId,
      state: 'active',
      their_label: 'Holder',
    };
  }

  async listCredentialDefinitions(): Promise<CredentialDefinition[]> {
    return [
      {
        credDefId: 'stub-cred-def-1',
        schemaId: 'stub-schema-1',
        tag: 'medical-license',
      },
    ];
  }
}
