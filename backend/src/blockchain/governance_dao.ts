// governance_dao.ts - simple governance council DAO for the chai-vc-platform

export type ProposalType = 'FEE_ADJUSTMENT' | 'RULE_CHANGE';

export interface Proposal {
  id: number;
  type: ProposalType;
  description: string;
  votesFor: Set<string>;
  votesAgainst: Set<string>;
  executed: boolean;
}

export class GovernanceDAO {
  private members: Set<string> = new Set();
  private proposals: Proposal[] = [];
  private nextProposalId = 1;

  addMember(address: string): void {
    this.members.add(address);
  }

  removeMember(address: string): void {
    this.members.delete(address);
  }

  listMembers(): string[] {
    return Array.from(this.members);
  }

  createProposal(type: ProposalType, description: string): Proposal {
    const proposal: Proposal = {
      id: this.nextProposalId++,
      type,
      description,
      votesFor: new Set(),
      votesAgainst: new Set(),
      executed: false,
    };
    this.proposals.push(proposal);
    return proposal;
  }

  vote(address: string, proposalId: number, support: boolean): void {
    if (!this.members.has(address)) {
      throw new Error('Only members can vote');
    }
    const proposal = this.proposals.find((p) => p.id === proposalId);
    if (!proposal || proposal.executed) {
      throw new Error('Invalid proposal');
    }

    proposal.votesFor.delete(address);
    proposal.votesAgainst.delete(address);

    if (support) {
      proposal.votesFor.add(address);
    } else {
      proposal.votesAgainst.add(address);
    }
  }

  tallyVotes(proposalId: number): 'PASSED' | 'FAILED' | 'PENDING' {
    const proposal = this.proposals.find((p) => p.id === proposalId);
    if (!proposal) {
      throw new Error('Proposal not found');
    }
    const totalMembers = this.members.size;
    const votesCast = proposal.votesFor.size + proposal.votesAgainst.size;
    if (votesCast < totalMembers) {
      return 'PENDING';
    }
    return proposal.votesFor.size > proposal.votesAgainst.size
      ? 'PASSED'
      : 'FAILED';
  }

  executeProposal(proposalId: number): void {
    const proposal = this.proposals.find((p) => p.id === proposalId);
    if (!proposal) {
      throw new Error('Proposal not found');
    }
    if (proposal.executed) {
      throw new Error('Proposal already executed');
    }
    if (this.tallyVotes(proposalId) !== 'PASSED') {
      throw new Error('Proposal has not passed');
    }
    // In a real implementation, blockchain logic to update fees or rules would go here.
    proposal.executed = true;
  }

  listProposals(): Proposal[] {
    return this.proposals;
  }
}

// This file provides a basic in-memory DAO structure. It can be integrated
// with smart contracts for on-chain governance in future iterations.
