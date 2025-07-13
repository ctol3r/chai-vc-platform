import fs from 'fs/promises';

export interface SelectiveProof {
  proof: Uint8Array;
  publicInputs: Uint8Array;
}

export async function verify_selective_proof(
  wasmPath: string,
  selectiveProof: SelectiveProof
): Promise<boolean> {
  const wasmBuffer = await fs.readFile(wasmPath);
  const wasmModule = await WebAssembly.instantiate(wasmBuffer, {});

  const verifier = (wasmModule.instance.exports as any).verify_selective_proof;
  if (typeof verifier !== 'function') {
    throw new Error('verify_selective_proof function missing in WASM');
  }

  // Actual memory management is omitted in this stub implementation.
  const result = verifier();

  return !!result;
}
