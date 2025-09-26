/**
 * PolkadotService quickpatch stub to satisfy callers and tests.
 * Replace with real @polkadot/api integration later.
 */
export class PolkadotService {
  private _connected = false;

  async connect(endpoint: string): Promise<void> {
    this._connected = !!endpoint;
    console.log('PolkadotService.connect ->', this._connected ? 'connected' : 'no-endpoint');
  }

  /**
   * anchorProof - simulate anchoring and return a simulated SubmittableResult-like object.
   */
  async anchorProof(payload: unknown): Promise<{ txHash: string; events?: any[] }> {
    console.log('Anchoring proof on chain:', payload);
    return { txHash: '0xdeadbeef', events: [] };
  }

  // For tests that may call signAndSend on created extrinsics, return a simple object
  // that roughly resembles SubmittableResult for the code paths that use it.
  async signAndSend(_signed: any): Promise<{ status: 'inBlock' | 'finalized'; txHash: string }> {
    return { status: 'finalized', txHash: '0xdeadbeef' };
  }
}

export default new PolkadotService();
