export class MetricsCollector {
  private issuanceLatencies: number[] = [];
  private verificationTimeSavings: number[] = [];

  recordIssuance(start: number, end: number): void {
    this.issuanceLatencies.push(end - start);
  }

  recordVerificationSaved(milliseconds: number): void {
    this.verificationTimeSavings.push(milliseconds);
  }

  getAverageIssuanceLatency(): number {
    if (this.issuanceLatencies.length === 0) {
      return 0;
    }
    const sum = this.issuanceLatencies.reduce((a, b) => a + b, 0);
    return sum / this.issuanceLatencies.length;
  }

  getTotalVerificationTimeSaved(): number {
    return this.verificationTimeSavings.reduce((a, b) => a + b, 0);
  }
}

