export interface Badge {
  id: string;
  name: string;
  description: string;
}

export class BadgeService {
  private issuerBadges: Map<string, Badge[]> = new Map();

  awardBadge(issuerId: string, badge: Badge): void {
    const badges = this.issuerBadges.get(issuerId) || [];
    badges.push(badge);
    this.issuerBadges.set(issuerId, badges);
  }

  getBadges(issuerId: string): Badge[] {
    return this.issuerBadges.get(issuerId) || [];
  }
}
