import { Contract, BigNumberish, providers, Signer } from 'ethers';
import VerifierStakingArtifact from '../../contracts/VerifierStaking.json';

/**
 * Service for interacting with the VerifierStaking smart contract. This wraps
 * basic staking functionality so the rest of the backend can easily lock tokens
 * for verifiers and slash them if they misbehave.
 */
export class VerifierStakingService {
    private contract: Contract;

    constructor(address: string, signer: Signer) {
        this.contract = new Contract(address, VerifierStakingArtifact as any, signer);
    }

    /**
     * Stake tokens by sending native currency to the contract.
     */
    async stake(amount: BigNumberish) {
        return await this.contract.stake({ value: amount });
    }

    /**
     * Withdraw previously staked tokens.
     */
    async withdraw(amount: BigNumberish) {
        return await this.contract.withdraw(amount);
    }

    /**
     * Slash a verifier's stake. Only the contract owner can call this.
     */
    async slash(verifier: string, amount: BigNumberish) {
        return await this.contract.slash(verifier, amount);
    }
}
