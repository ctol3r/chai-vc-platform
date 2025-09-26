declare module '@oceanprotocol/lib' {
  export interface Config {
    metadataCacheUri?: string;
    oceanTokenAddress?: string;
    network?: string;
    [key: string]: unknown;
  }

  export interface Account {
    getId(): string;
  }

  export interface AssetFile {
    url: string;
    contentType: string;
  }

  export interface AssetMetadata {
    type: string;
    name: string;
    dateCreated: string;
    author: string;
    license: string;
    files: AssetFile[];
  }

  export interface Asset {
    main: AssetMetadata;
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

  export class Datatoken {
    constructor(web3: unknown, address: string);
    buy(accountId: string, price: string): Promise<void>;
  }
}
