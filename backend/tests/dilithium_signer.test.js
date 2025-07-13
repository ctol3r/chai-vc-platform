const assert = require('assert');
const { DilithiumSigner } = require('../src/crypto/dilithium_signer');

(async () => {
  const signer = new DilithiumSigner();
  const { publicKey, secretKey } = await signer.generateKeypair();
  const message = 'test message';
  const signature = await signer.sign(message, secretKey);
  assert.ok(signature.length > 0, 'signature should not be empty');
  const valid = await signer.verify(message, signature, publicKey);
  signer.close();
  assert.ok(valid, 'signature should verify');
  console.log('Dilithium signing test passed');
})();
