import { PolkadotService } from './polkadot_service';

const polkadot = new PolkadotService();

export function stakeReputation(userId: string, amount: number): void {
  polkadot.depositReputation(userId, amount);
}

export function releaseReputation(userId: string, amount: number): boolean {
  return polkadot.withdrawReputation(userId, amount);
}
