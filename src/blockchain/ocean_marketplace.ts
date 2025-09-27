/**
 * Quickpatch stub for Ocean marketplace SDK usage.
 * Replace with proper @oceanprotocol/lib usage later.
 */

export async function buyDatatoken(_datatokenId: string, _buyer: string, _price: number): Promise<boolean> {
  // Simulate buy success
  return true;
}

export async function getDatatokenBalance(_datatokenId: string, _account: string): Promise<number> {
  return 0;
}

export default { buyDatatoken, getDatatokenBalance };
