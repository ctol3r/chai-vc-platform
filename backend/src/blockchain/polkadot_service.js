/**
 * Simple PolkadotService stub used by tests.
 * Exposes a class (so code can `new PolkadotService()`), and a storeAuditRecord helper used in tests.
 */
class PolkadotService {
  async anchorProof(proof) {
    console.log('Anchoring proof on chain:', proof);
    // Simulate returning a transaction hash
    return `0x${Buffer.from(typeof proof === 'string' ? proof : JSON.stringify(proof)).toString('hex').slice(0, 8)}`;
  }

  // Tests expect a storeAuditRecord(...) method. Provide a simple implementation that forwards to anchorProof.
  async storeAuditRecord(record) {
    // Keep this lightweight — real implementation would submit a tx.
    return this.anchorProof(record);
  }

  // If other methods are expected later, add small stubs here to avoid runtime errors.
}

module.exports = PolkadotService;
module.exports.default = PolkadotService;
module.exports.PolkadotService = PolkadotService;
