import { CredentialAdapter } from '../types.js';

const exampleAdapter: CredentialAdapter = {
  network: 'example',
  async adapt(credential: any): Promise<any> {
    return { ...credential, adaptedFor: 'example' };
  },
};

export default exampleAdapter;
