import { groth16 } from 'snarkjs';
import fs from 'fs';

export async function generateProof(inputs: any, wasm: string, zkey: string) {
  return await groth16.fullProve(inputs, wasm, zkey);
}

export async function verifyProof(vkeyPath: string, proof: any, publicSignals: any) {
  const vkey = JSON.parse(fs.readFileSync(vkeyPath, 'utf8'));
  return await groth16.verify(vkey, publicSignals, proof);
}

if (require.main === module) {
  (async () => {
    const inputs = JSON.parse(fs.readFileSync('inputs.json', 'utf8'));
    const { proof, publicSignals } = await generateProof(inputs, 'selective_disclosure.wasm', 'selective_disclosure.zkey');
    const valid = await verifyProof('verification_key.json', proof, publicSignals);
    console.log('Proof valid:', valid);
  })();
}
