import { Contract, JsonRpcProvider, Signer, type BigNumberish } from 'ethers';

type Abi = any;

export class EvmErc721Wrapper {
  contract: Contract;

  constructor(address: string, abi: Abi, providerOrSigner: JsonRpcProvider | Signer) {
    this.contract = new Contract(address, abi as any, providerOrSigner as any);
  }

  async mint(to: string, tokenURI: string): Promise<number> {
    const tx = await this.contract.mint(to, tokenURI);
    const receipt = await tx.wait();
    const events = receipt.events ?? [];
    const tokenIdStr = events?.[0]?.args?.tokenId?.toString?.();
    return tokenIdStr ? Number(tokenIdStr) : 0;
  }

  async ownerOf(tokenId: BigNumberish): Promise<string> {
    return await this.contract.ownerOf(tokenId);
  }
}
