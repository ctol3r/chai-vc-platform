export interface CredentialAdapter {
  network: string;
  adapt: (credential: any) => Promise<any>;
}
