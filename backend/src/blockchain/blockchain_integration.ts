import { PolkadotService } from './polkadot_service';

// Simple facade used by other parts of the backend to interact with the chain
export class BlockchainIntegration {
  private service = new PolkadotService();

  async init(endpoint: string): Promise<void> {
    await this.service.connect(endpoint);
  }

  async setCredentialStatus(id: string, status: string): Promise<void> {
    await this.service.updateCredentialStatus(id, status);
  }
}
