import { verifyCrossChainClaim } from '../src/blockchain/cross_chain_claims';
import '../src/blockchain/polkadot_service';
import '../src/blockchain/ethereum_service';

(async () => {
  const did = 'did:example:123';
  const address = '0xABC';
  const ethSig = `${did}:${address}:ethereum`;
  const dotSig = `${did}:${address}:polkadot`;

  if (!(await verifyCrossChainClaim('ethereum', did, address, ethSig))) {
    throw new Error('Ethereum claim failed');
  }
  if (!(await verifyCrossChainClaim('polkadot', did, address, dotSig))) {
    throw new Error('Polkadot claim failed');
  }
  console.log('all tests passed');
})();
