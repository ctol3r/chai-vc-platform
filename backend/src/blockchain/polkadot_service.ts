import { verifyProofOnChain, SelectiveProof } from './blockchain_integration';

export async function verifySelectiveProofRuntime(
  wasmPath: string,
  proof: SelectiveProof
): Promise<boolean> {
  // In a real polkadot runtime, this would invoke the on-chain method.
  return verifyProofOnChain(wasmPath, proof);
}
