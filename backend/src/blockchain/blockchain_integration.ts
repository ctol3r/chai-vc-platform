import { RefereeEndorsement, RefereeAttestationService } from './referee_attestation';

export class BlockchainIntegration {
  private refereeService = new RefereeAttestationService();

  /**
   * Record a referee's endorsement as an on-chain attestation.
   * Returns the transaction or attestation identifier.
   */
  async recordRefereeEndorsement(endorsement: RefereeEndorsement): Promise<string> {
    // In a real system additional logic would be added here to
    // interface with the chosen blockchain network.
    return this.refereeService.endorse(endorsement);
  }
}
