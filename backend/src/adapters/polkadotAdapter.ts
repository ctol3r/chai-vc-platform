import { CredentialAdapter } from '../types.js';

const polkadotAdapter: CredentialAdapter = {
  network: 'polkadot',
  async adapt(credential: any): Promise<any> {
    return { ...credential, adaptedFor: 'polkadot' };
  },
};

export default polkadotAdapter;
