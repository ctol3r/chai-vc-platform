export interface NetworkVerifier {
  verifyAddressOwnership(did: string, address: string, signature: string): Promise<boolean>;
}

const verifiers: Record<string, NetworkVerifier> = {};

export function registerNetworkVerifier(network: string, verifier: NetworkVerifier) {
  verifiers[network] = verifier;
}

export async function verifyCrossChainClaim(
  network: string,
  did: string,
  address: string,
  signature: string
): Promise<boolean> {
  const verifier = verifiers[network];
  if (!verifier) {
    throw new Error(`No verifier registered for network ${network}`);
  }
  return verifier.verifyAddressOwnership(did, address, signature);
}
