import { Governance, EconomicParameters } from './governance';

// Default economic parameters for the platform.
const defaultParameters: EconomicParameters = {
  interestRate: 0.05,
  inflationRate: 0.02,
};

// Export a singleton governance instance that can be used by other modules.
export const governance = new Governance(defaultParameters);

export function submitGovernanceProposal(proposer: string, params: Partial<EconomicParameters>) {
  return governance.proposeChange(proposer, params);
}
