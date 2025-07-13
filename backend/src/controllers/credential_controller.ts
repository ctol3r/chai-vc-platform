import { DIDComm } from 'didcomm';
import { BlockchainIntegration } from '../blockchain/blockchain_integration';

// Controller responsible for coordinating credential issuance flows.
export class CredentialController {
  private integration: BlockchainIntegration;

  constructor(didcomm: DIDComm) {
    this.integration = new BlockchainIntegration(didcomm);
  }

  async issueCredential(credential: any, walletEndpoint: string) {
    await this.integration.sendCredentialOffer(credential, walletEndpoint);
  }
}
