import axios, { AxiosInstance } from 'axios';

/**
 * Bullhorn ATS/CRM API connector.
 */
export class BullhornConnector {
  private client: AxiosInstance;
  private restToken: string;

  constructor(private bhClientId: string, private bhClientSecret: string, private bhUsername: string, private bhPassword: string) {
    this.restToken = '';
    this.client = axios.create({ baseURL: 'https://rest.bullhornstaffing.com/rest-services' });
  }

  /**
   * Authenticate with Bullhorn and set rest token.
   */
  async authenticate(): Promise<void> {
    const authRes = await axios.get('https://auth.bullhornstaffing.com/oauth/authorize', {
      params: {
        client_id: this.bhClientId,
        response_type: 'code',
        username: this.bhUsername,
        password: this.bhPassword,
        action: 'Login',
      },
    });
    const code = authRes.data; // simplified for example
    const tokenRes = await axios.post('https://auth.bullhornstaffing.com/oauth/token', null, {
      params: {
        grant_type: 'authorization_code',
        code,
        client_id: this.bhClientId,
        client_secret: this.bhClientSecret,
      },
    });
    this.restToken = tokenRes.data.access_token;
  }

  async getCandidate(id: string): Promise<any> {
    const res = await this.client.get(`/bhrest/${this.restToken}/entity/Candidate/${id}`);
    return res.data;
  }

  async createCandidate(data: any): Promise<any> {
    const res = await this.client.put(`/bhrest/${this.restToken}/entity/Candidate`, data);
    return res.data;
  }

  async updateCandidate(id: string, data: any): Promise<any> {
    const res = await this.client.post(`/bhrest/${this.restToken}/entity/Candidate/${id}`, data);
    return res.data;
  }
}
