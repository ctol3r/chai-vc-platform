const snarkjs = require('snarkjs');
const fs = require('fs');

async function verify(vKeyPath, proofPath, publicPath) {
  const vkey = JSON.parse(fs.readFileSync(vKeyPath));
  const proof = JSON.parse(fs.readFileSync(proofPath));
  const publicSignals = JSON.parse(fs.readFileSync(publicPath));
  const res = await snarkjs.groth16.verify(vkey, publicSignals, proof);
  console.log('Proof valid:', res);
  return res;
}

if (require.main === module) {
  verify(process.argv[2], process.argv[3], process.argv[4]).then(valid => {
    if (!valid) process.exit(1);
  });
}

module.exports = verify;
