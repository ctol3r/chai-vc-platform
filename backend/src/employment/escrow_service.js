/**
 * Simple in-memory escrow service to emulate on-chain escrow functionality.
 */
class EscrowService {
  constructor() {
    this.deposits = new Map();
  }

  createEscrow(offerId, amount) {
    if (this.deposits.has(offerId)) {
      throw new Error('Escrow already exists for offer');
    }
    this.deposits.set(offerId, { amount, released: false });
  }

  releaseEscrow(offerId) {
    const escrow = this.deposits.get(offerId);
    if (!escrow) {
      throw new Error('Escrow not found');
    }
    if (escrow.released) {
      throw new Error('Escrow already released');
    }
    escrow.released = true;
  }

  getEscrow(offerId) {
    return this.deposits.get(offerId);
  }
}
module.exports = { EscrowService };
