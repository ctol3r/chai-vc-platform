const {
  generateBls12381G2KeyPair,
  blsSign,
  blsCreateProof
} = require('@mattrglobal/bbs-signatures');

function encodeMessage(message) {
  return Uint8Array.from(Buffer.from(String(message), 'utf-8'));
}

async function generateKeyPair() {
  return await generateBls12381G2KeyPair();
}

async function signCredential({ keyPair, credential }) {
  const messages = Object.values(credential).map(encodeMessage);
  const signature = await blsSign({ keyPair, messages });
  return { signature, messages };
}

async function deriveProof({ keyPair, signature, messages, revealIndexes, nonce }) {
  return await blsCreateProof({
    signature,
    publicKey: keyPair.publicKey,
    messages,
    nonce: encodeMessage(nonce || 'nonce'),
    revealed: revealIndexes,
  });
}

module.exports = {
  generateKeyPair,
  signCredential,
  deriveProof,
};
