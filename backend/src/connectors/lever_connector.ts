import axios, { AxiosInstance } from 'axios';

/**
 * Lever ATS API connector.
 */
export class LeverConnector {
  private client: AxiosInstance;

  constructor(apiKey: string) {
    this.client = axios.create({
      baseURL: 'https://api.lever.co/v1',
      headers: { Authorization: `Bearer ${apiKey}` },
    });
  }

  async getCandidate(id: string): Promise<any> {
    const res = await this.client.get(`/candidates/${id}`);
    return res.data;
  }

  async createCandidate(data: any): Promise<any> {
    const res = await this.client.post('/candidates', data);
    return res.data;
  }

  async updateCandidate(id: string, data: any): Promise<any> {
    const res = await this.client.put(`/candidates/${id}`, data);
    return res.data;
  }
}
