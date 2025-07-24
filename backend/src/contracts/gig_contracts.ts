export interface GigContract {
  id: string;
  workerId: string;
  employerId: string;
  startDate: Date;
  endDate: Date;
  paymentAmount: number; // in arbitrary currency units
}

export type PaymentCallback = (gig: GigContract) => void;

export class GigScheduler {
  private paymentCallback: PaymentCallback;

  constructor(paymentCallback: PaymentCallback) {
    this.paymentCallback = paymentCallback;
  }

  // Schedule a gig and automatically trigger payment when it ends
  scheduleGig(gig: GigContract): void {
    const now = Date.now();
    const endTime = gig.endDate.getTime();
    const delay = Math.max(0, endTime - now);
    setTimeout(() => {
      this.paymentCallback(gig);
    }, delay);
  }
}
