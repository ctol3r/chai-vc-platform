import { DIDComm } from 'didcomm';
import { DIDCommService } from '../didcomm/didcomm_service';

// Example integration that wires DIDComm messaging into the blockchain layer.
export class BlockchainIntegration {
  private messaging: DIDCommService;

  constructor(didcomm: DIDComm) {
    this.messaging = new DIDCommService(didcomm);
  }

  async sendCredentialOffer(message: any, endpoint: string) {
    await this.messaging.sendMessage(message, endpoint);
  }
}
