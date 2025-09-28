/* Temporary ambient shims to unblock local builds.
   Replace with proper updated types in follow-up (ethers v6 -> proper interfaces, @oceanprotocol/lib, polkadot/api). */

declare module '@oceanprotocol/lib' {
  export class Datatoken {
    constructor(web3: unknown, address: string);
    buy(accountId: string, price: string): Promise<void>;
  }
  export interface Config {
    [key: string]: unknown;
  }
  export interface Account {
    getId(): string;
  }
  export interface Asset {
    main: Record<string, unknown>;
  }
  export interface AssetWithToken extends Asset {
    dataToken: string;
  }
  export class Ocean {
    constructor(config: Config);
    assets: {
      create(asset: Asset, publisherAccount: Account): Promise<AssetWithToken>;
      createAccessServiceAttributes(
        datatokenAddress: string,
        publisherAccount: Account,
        price: string
      ): Promise<void>;
    };
    web3: unknown;
  }
  export class VeOcean {}
}

declare module '@polkadot/api' {
  export class ApiPromise {
    static create(options: Record<string, unknown>): Promise<ApiPromise>;
    tx: Record<string, any>;
    query: Record<string, any>;
  }
  export class WsProvider {
    constructor(endpoint: string);
  }
  export type SubmittableResult = Record<string, unknown>;
}

declare module 'ethers' {
  export type BigNumberish = string | number | bigint;
  export type ContractRunner = unknown;
  export type ContractTransactionResponse = Record<string, unknown>;
  export type InterfaceAbi = ReadonlyArray<string | Record<string, unknown>>;
  export type BaseContract = Record<string, any>;

  export class Contract {
    constructor(address: string, abi: InterfaceAbi, runner: ContractRunner);
    connect(runner: ContractRunner): Contract;
    [key: string]: any;
  }

  export class Interface {
    constructor(abi: InterfaceAbi);
  }

  export class BrowserProvider {}
  export class JsonRpcProvider {
    constructor(url: string);
    getSigner(index?: number | string): Promise<unknown>;
    listAccounts(): Promise<string[]>;
  }

  export namespace providers {
    type Provider = unknown;
  }
}
