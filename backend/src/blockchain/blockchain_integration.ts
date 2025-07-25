// blockchain_integration.ts - placeholder for overall blockchain integration

import { ChainlinkAdapter } from './oracles/chainlink_adapter';

export class BlockchainIntegration {
  private chainlink = new ChainlinkAdapter();

  async getLicenseStatus(licenseId: string) {
    return this.chainlink.fetchLicenseStatus(licenseId);
  }

  async getRiskSignals(address: string) {
    return this.chainlink.fetchRiskSignals(address);
  }
}
