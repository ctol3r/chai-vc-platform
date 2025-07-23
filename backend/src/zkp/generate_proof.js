const snarkjs = require('snarkjs');
const fs = require('fs');

async function generateProof(inputs, wasm, zkey) {
  return await snarkjs.groth16.fullProve(inputs, wasm, zkey);
}

async function verifyProof(vkeyPath, proof, publicSignals) {
  const vkey = JSON.parse(fs.readFileSync(vkeyPath, 'utf8'));
  return await snarkjs.groth16.verify(vkey, publicSignals, proof);
}

if (require.main === module) {
  (async () => {
    const inputs = JSON.parse(fs.readFileSync('inputs.json', 'utf8'));
    const { proof, publicSignals } = await generateProof(inputs, 'selective_disclosure.wasm', 'selective_disclosure.zkey');
    const valid = await verifyProof('verification_key.json', proof, publicSignals);
    console.log('Proof valid:', valid);
  })();
}

module.exports = { generateProof, verifyProof };
