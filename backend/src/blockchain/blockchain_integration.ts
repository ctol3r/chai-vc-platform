import { verify_selective_proof, SelectiveProof } from './snark_verifier';

export async function verifyProofOnChain(
  wasmPath: string,
  selectiveProof: SelectiveProof
): Promise<boolean> {
  return verify_selective_proof(wasmPath, selectiveProof);
}
