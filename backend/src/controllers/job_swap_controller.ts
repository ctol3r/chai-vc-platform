export type JobSwapStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';

export interface JobSwap {
  id: string;
  requesterId: string;
  recipientId: string;
  stake: number;
  status: JobSwapStatus;
}

export class JobSwapController {
  private swaps: JobSwap[] = [];

  createSwap(requesterId: string, recipientId: string, stake: number): JobSwap {
    const swap: JobSwap = {
      id: `swap-${this.swaps.length + 1}`,
      requesterId,
      recipientId,
      stake,
      status: 'PENDING'
    };
    this.swaps.push(swap);
    return swap;
  }

  approveSwap(id: string): JobSwap | undefined {
    const swap = this.swaps.find(s => s.id === id);
    if (swap) {
      swap.status = 'APPROVED';
    }
    return swap;
  }

  finalizeSwap(id: string): JobSwap | undefined {
    const swap = this.swaps.find(s => s.id === id);
    if (swap && swap.status === 'APPROVED') {
      swap.status = 'COMPLETED';
    }
    return swap;
  }
}
