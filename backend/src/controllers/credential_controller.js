const crypto = require('crypto');

const keyPair = crypto.generateKeyPairSync('ed25519');

function signCredential(vc) {
  const data = Buffer.from(JSON.stringify(vc));
  const signature = crypto.sign(null, data, keyPair.privateKey);
  const proof = {
    type: 'Ed25519Signature2020',
    created: new Date().toISOString(),
    proofValue: signature.toString('base64'),
    verificationMethod: 'did:example:issuer#key-1'
  };
  return { ...vc, proof };
}

module.exports = { signCredential };
