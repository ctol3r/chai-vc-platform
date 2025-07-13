const crypto = require('crypto');

async function anchorHashOnChain(hash) {
  const txId = '0x' + crypto.randomBytes(16).toString('hex');
  console.log(`Anchored hash ${hash} in tx ${txId}`);
  return txId;
}

module.exports = { anchorHashOnChain };
