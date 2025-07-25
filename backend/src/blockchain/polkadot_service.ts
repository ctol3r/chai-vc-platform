/**
 * Simple in-memory representation of a Polkadot service. In the real
 * implementation this would interact with the blockchain. Here we only
 * emulate append-only behaviour for testing.
 */
export class PolkadotService {
  private logs: string[] = [];

  /**
   * Append an immutable log entry to the on-chain log.
   */
  async appendLog(entry: string): Promise<void> {
    // In a real environment this would submit a transaction.
    this.logs.push(entry);
  }

  /**
   * Retrieve all log entries.
   */
  getLogs(): string[] {
    // Return a copy to enforce immutability from the outside.
    return [...this.logs];
  }
}

