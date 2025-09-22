declare module 'ethers' {
  export class Contract {
    constructor(...args:any[]);
    // minimal methods used in tests/implementation
    stake?: (opts?: any) => Promise<any>;
    withdraw?: (amount?: any) => Promise<any>;
    slash?: (verifier?: any, amount?: any) => Promise<any>;
    [k: string]: any;
  }
  export type BigNumberish = any;
  export namespace providers { const anyProvider: any; export { anyProvider as Provider }; }
  export type Signer = any;
  export const providers: any;
  export = {} as any;
}
