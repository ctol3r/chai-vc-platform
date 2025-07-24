// Simple in-memory mock of reputation staking on a Polkadot-like network
export class PolkadotService {
  private balances: Record<string, number> = {};

  depositReputation(userId: string, amount: number): void {
    this.balances[userId] = (this.balances[userId] || 0) + amount;
  }

  withdrawReputation(userId: string, amount: number): boolean {
    const current = this.balances[userId] || 0;
    if (current < amount) {
      return false;
    }
    this.balances[userId] = current - amount;
    return true;
  }
}
