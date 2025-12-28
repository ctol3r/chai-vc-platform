import { ethers } from "ethers";

// Minimal ABI and bytecode placeholders for the CrossChainDAO contract.
const CrossChainDAOAbi = [
  "function propose(string description, uint256 votingPeriod) public returns (uint256)",
  "function vote(uint256 proposalId, bool support) public",
  "function receiveCrossChainVote(uint256 proposalId, address voter, bool support, uint256 weight, string sourceChain) public"
];
// In a real deployment this would be the compiled bytecode output by the Solidity compiler.
const CrossChainDAOBytecode = "0x";

/**
 * Simple wrapper around the CrossChainDAO smart contract using ethers.js.
 * Provides helpers to deploy the contract and interact with governance features.
 */
export class BlockchainIntegration {
  private provider: ethers.providers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  public contract?: ethers.Contract;

  constructor(rpcUrl: string, privateKey: string, contractAddress?: string) {
    this.provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    this.wallet = new ethers.Wallet(privateKey, this.provider);
    if (contractAddress) {
      this.contract = new ethers.Contract(contractAddress, CrossChainDAOAbi, this.wallet);
    }
  }

  /** Deploy a new DAO instance and store the connected contract. */
  async deployDAO(): Promise<string> {
    const factory = new ethers.ContractFactory(CrossChainDAOAbi, CrossChainDAOBytecode, this.wallet);
    const contract = await factory.deploy(this.wallet.address);
    await contract.deployed();
    this.contract = contract;
    return contract.address;
  }

  /** Create a proposal describing an off-chain governance action. */
  async propose(description: string, votingPeriod: number): Promise<ethers.ContractTransactionReceipt> {
    if (!this.contract) throw new Error("Contract not initialised");
    const tx = await this.contract.propose(description, votingPeriod);
    return tx.wait();
  }

  /** Cast a vote for or against a proposal. */
  async vote(proposalId: number, support: boolean): Promise<ethers.ContractTransactionReceipt> {
    if (!this.contract) throw new Error("Contract not initialised");
    const tx = await this.contract.vote(proposalId, support);
    return tx.wait();
  }

  /** Relay a vote from a different chain into the DAO. */
  async receiveCrossChainVote(
    proposalId: number,
    voter: string,
    support: boolean,
    weight: number,
    sourceChain: string
  ): Promise<ethers.ContractTransactionReceipt> {
    if (!this.contract) throw new Error("Contract not initialised");
    const tx = await this.contract.receiveCrossChainVote(proposalId, voter, support, weight, sourceChain);
    return tx.wait();
  }
}

export default BlockchainIntegration;
