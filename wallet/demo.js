const { generateKeyPair, signCredential, deriveProof } = require('./bbs_wallet');

(async () => {
  const credential = { name: 'Alice', age: '30', role: 'Nurse' };
  const keyPair = await generateKeyPair();
  const { signature, messages } = await signCredential({ keyPair, credential });
  console.log('Signature:', Buffer.from(signature).toString('base64'));
  const proof = await deriveProof({
    keyPair,
    signature,
    messages,
    revealIndexes: [0],
    nonce: 'example nonce',
  });
  console.log('Proof:', Buffer.from(proof).toString('base64'));
})();
