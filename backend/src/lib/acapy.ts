import fetch from 'node-fetch';
import https from 'https';

/**
 * ACA-Py (Aries Cloud Agent - Python) Client
 * Secure client for interacting with ACA-Py for credential issuance
 */

export interface ACAPayConfig {
  baseUrl: string;
  apiKey?: string;
  useTLS?: boolean;
  rejectUnauthorized?: boolean;
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

  constructor(config: ACAPayConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.apiKey = config.apiKey;

    // Configure HTTPS agent for TLS
    if (config.useTLS) {
      this.agent = new https.Agent({
        rejectUnauthorized: config.rejectUnauthorized !== false,
      });
    }
  }

  /**
   * Make an authenticated request to ACA-Py
   */
  private async request(
    method: string,
    path: string,
    body?: any
  ): Promise<any> {
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
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(`ACA-Py request failed: ${response.status} - ${error}`);
      }

      return await response.json();
    } catch (err: any) {
      throw new Error(`ACA-Py connection error: ${err.message}`);
    }
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
