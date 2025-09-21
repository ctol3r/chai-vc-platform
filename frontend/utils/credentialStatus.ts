// Helper used by wallet cards to present a badge for on-chain credential status.
export type ChainStatus = 'ACTIVE' | 'REVOKED' | 'EXPIRED' | undefined | null;

type BadgeDescriptor = {
  label: string;
  tone: 'success' | 'danger' | 'warning' | 'secondary';
};

export function badgeForStatus(status: ChainStatus): BadgeDescriptor {
  switch (status) {
    case 'ACTIVE':
      return { label: 'Verified on-chain', tone: 'success' };
    case 'REVOKED':
      return { label: 'Revoked', tone: 'danger' };
    case 'EXPIRED':
      return { label: 'Expired', tone: 'warning' };
    default:
      return { label: 'Unverified', tone: 'secondary' };
  }
}
