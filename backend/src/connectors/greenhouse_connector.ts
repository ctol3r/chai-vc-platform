import axios, { AxiosInstance } from 'axios';

/**
 * Greenhouse ATS API connector.
 */
export class GreenhouseConnector {
  private client: AxiosInstance;

  constructor(apiKey: string) {
    this.client = axios.create({
      baseURL: 'https://harvest.greenhouse.io/v1',
      auth: { username: apiKey, password: '' },
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
    const res = await this.client.patch(`/candidates/${id}`, data);
    return res.data;
  }
}
