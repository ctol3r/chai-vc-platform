import axios, { AxiosInstance } from 'axios';

/**
 * HubSpot CRM API connector.
 */
export class HubspotConnector {
  private client: AxiosInstance;

  constructor(private apiKey: string) {
    this.client = axios.create({
      baseURL: 'https://api.hubapi.com',
      params: { hapikey: apiKey },
    });
  }

  async getContact(id: string): Promise<any> {
    const res = await this.client.get(`/crm/v3/objects/contacts/${id}`);
    return res.data;
  }

  async createContact(data: any): Promise<any> {
    const res = await this.client.post('/crm/v3/objects/contacts', data);
    return res.data;
  }

  async updateContact(id: string, data: any): Promise<any> {
    const res = await this.client.patch(`/crm/v3/objects/contacts/${id}`, data);
    return res.data;
  }
}
