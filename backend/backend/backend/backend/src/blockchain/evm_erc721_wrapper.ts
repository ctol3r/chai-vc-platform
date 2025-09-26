import { BigNumberish, Contract, Signer, Interface } from 'ethers';
type ProviderOrSigner = any; // defensive while upstream types drift

export class EvmERC721Wrapper {
  contract: Contract;
  constructor(address: string, abi: any, providerOrSigner: ProviderOrSigner) {
    const iface = abi instanceof Interface ? abi : new Interface(abi as any);
    this.contract = new Contract(address, iface as any, providerOrSigner as any);
  }

  async connect(signer: Signer) {
    this.contract = (this.contract as any).connect(signer);
    return this.contract;
  }

  async mint(to: string, tokenURI: string): Promise<BigNumberish> {
    return (this.contract as any).mint(to, tokenURI);
  }

  async tokenURI(tokenId: BigNumberish): Promise<string> {
    return (this.contract as any).tokenURI(tokenId);
  }
}
