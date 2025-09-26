import { Contract, Interface } from 'ethers';
import type {
  BaseContract,
  BigNumberish,
  ContractRunner,
  ContractTransactionResponse,
  InterfaceAbi,
} from 'ethers';

export type ChaiSoulboundTokenContract = BaseContract & {
  mint(to: string, tokenURI: string): Promise<ContractTransactionResponse>;
  tokenURI(tokenId: BigNumberish): Promise<string>;
  ownerOf(tokenId: BigNumberish): Promise<string>;
  balanceOf(owner: string): Promise<bigint>;
};

const toInterface = (abi: Interface | InterfaceAbi): Interface =>
  abi instanceof Interface ? abi : new Interface(abi);

const hasSignerCapabilities = (runner: ContractRunner | null): runner is ContractRunner & {
  provider?: unknown;
  sendTransaction: unknown;
} =>
  Boolean(
    runner &&
      typeof (runner as { sendTransaction?: unknown }).sendTransaction === 'function'
  );

/**
 * ERC-721 wrapper around the CHAI Soulbound Token contract.
 * Provides a typed interface for interacting with the deployed contract.
 */
export class ChaiSoulboundToken {
  private contract: ChaiSoulboundTokenContract;
  private readonly contractInterface: Interface;

  constructor(
    address: string,
    runner: ContractRunner,
    abi: Interface | InterfaceAbi = ChaiSoulboundToken.DEFAULT_ABI,
  ) {
    this.contractInterface = toInterface(abi);
    this.contract = new Contract(
      address,
      this.contractInterface,
      runner,
    ) as unknown as ChaiSoulboundTokenContract;
  }

  /**
   * Connect the wrapper to a new runner (provider or signer).
   */
  connect(runner: ContractRunner): void {
    this.contract = this.contract.connect(runner) as unknown as ChaiSoulboundTokenContract;
  }

  /**
   * Mint a new soulbound token to the target address.
   * Requires the contract to be connected with a signer runner.
   */
  async mintSoulboundToken(to: string, tokenURI: string): Promise<ContractTransactionResponse> {
    const runner = this.contract.runner ?? null;
    if (!hasSignerCapabilities(runner)) {
      throw new Error('Contract is not connected with a signer');
    }

    return this.contract.mint(to, tokenURI);
  }

  /** Retrieve the token URI for the given token id. */
  async tokenURI(tokenId: BigNumberish): Promise<string> {
    return this.contract.tokenURI(tokenId);
  }

  /** Get the owner of the specified token. */
  async ownerOf(tokenId: BigNumberish): Promise<string> {
    return this.contract.ownerOf(tokenId);
  }

  /** Obtain the token balance for the owner. */
  async balanceOf(owner: string): Promise<bigint> {
    return this.contract.balanceOf(owner);
  }

  /** Access the underlying contract instance for advanced usage in tests. */
  getContract(): ChaiSoulboundTokenContract {
    return this.contract;
  }

  /** The default ABI with the minimal ERC-721 methods required. */
  static readonly DEFAULT_ABI: InterfaceAbi = [
    'function mint(address to, string tokenURI) returns (uint256)',
    'function tokenURI(uint256 tokenId) view returns (string)',
    'function ownerOf(uint256 tokenId) view returns (address)',
    'function balanceOf(address owner) view returns (uint256)',
    'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
  ];
}

export default ChaiSoulboundToken;
