import { ApiPromise } from '@polkadot/api';
import { blake2AsHex, cryptoWaitReady } from '@polkadot/util-crypto';

/**
 * Hash AI output using Blake2 and store it on-chain via the `decisions` pallet.
 *
 * @param api - Initialized Polkadot API instance.
 * @param aiOutput - Raw output from the AI system.
 * @param signer - Account that will submit the transaction.
 * @returns The hex-encoded hash that was stored on-chain.
 */
export async function hashAndStoreDecision(
  api: ApiPromise,
  aiOutput: string,
  signer: any
): Promise<string> {
  await cryptoWaitReady();
  const decisionHash = blake2AsHex(aiOutput);

  await api.tx.decisions
    .recordDecision(decisionHash)
    .signAndSend(signer);

  return decisionHash;
}
