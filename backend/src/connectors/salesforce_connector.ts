import axios, { AxiosInstance } from 'axios';

/**
 * Salesforce CRM API connector.
 */
export class SalesforceConnector {
  private client: AxiosInstance;

  constructor(private instanceUrl: string, private accessToken: string) {
    this.client = axios.create({
      baseURL: `${instanceUrl}/services/data/v56.0`,
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  }

  async getContact(id: string): Promise<any> {
    const res = await this.client.get(`/sobjects/Contact/${id}`);
    return res.data;
  }

  async createContact(data: any): Promise<any> {
    const res = await this.client.post('/sobjects/Contact', data);
    return res.data;
  }

  async updateContact(id: string, data: any): Promise<any> {
    const res = await this.client.patch(`/sobjects/Contact/${id}`, data);
    return res.data;
  }
}
