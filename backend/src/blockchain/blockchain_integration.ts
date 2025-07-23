import { PolkadotService } from './polkadot_service';
import { hashAndStoreDecision } from './decisions_pallet';

const polkadotService = new PolkadotService();

/**
 * Anchor a piece of AI-generated output on-chain by hashing it and sending
 * it to the `decisions` pallet.
 *
 * @param endpoint - WebSocket endpoint of the target chain.
 * @param aiOutput - Raw AI output that should be anchored on-chain.
 * @param signer - Account used to sign the transaction.
 */
export async function anchorDecision(
  endpoint: string,
  aiOutput: string,
  signer: any
): Promise<string> {
  const api = await polkadotService.connect(endpoint);
  return hashAndStoreDecision(api, aiOutput, signer);
}
