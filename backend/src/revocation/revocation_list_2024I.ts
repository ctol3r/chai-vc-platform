export class RevocationList2024I {
  private lists: Map<string, Uint8Array> = new Map();

  /**
   * Create a new revocation list for a given VC type with the specified size.
   * Size is expressed in bits. The underlying storage uses a Uint8Array.
   */
  createList(vcType: string, size: number): void {
    const byteLength = Math.ceil(size / 8);
    if (this.lists.has(vcType)) {
      throw new Error(`Revocation list for ${vcType} already exists`);
    }
    this.lists.set(vcType, new Uint8Array(byteLength));
  }

  /**
   * Mark the credential at the given index as revoked.
   */
  revoke(vcType: string, index: number): void {
    const list = this.getList(vcType);
    const byteIndex = Math.floor(index / 8);
    const bitIndex = index % 8;
    list[byteIndex] |= 1 << bitIndex;
  }

  /**
   * Clear the revocation flag at the given index.
   */
  restore(vcType: string, index: number): void {
    const list = this.getList(vcType);
    const byteIndex = Math.floor(index / 8);
    const bitIndex = index % 8;
    list[byteIndex] &= ~(1 << bitIndex);
  }

  /**
   * Check whether the credential at the given index is revoked.
   */
  isRevoked(vcType: string, index: number): boolean {
    const list = this.getList(vcType);
    const byteIndex = Math.floor(index / 8);
    const bitIndex = index % 8;
    return (list[byteIndex] & (1 << bitIndex)) !== 0;
  }

  /**
   * Internal helper to fetch a list or throw if not found.
   */
  private getList(vcType: string): Uint8Array {
    const list = this.lists.get(vcType);
    if (!list) {
      throw new Error(`Revocation list for ${vcType} does not exist`);
    }
    return list;
  }
}
