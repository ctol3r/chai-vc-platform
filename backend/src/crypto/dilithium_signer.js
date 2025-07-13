const { initDilithium, cleanupDilithium } = require('@red_pandas/pq-js');

class DilithiumSigner {
  constructor() {
    this.wrapper = null;
    this.ready = initDilithium().then(wrappers => {
      this.wrapper = wrappers.dilithium2; // use Dilithium2 by default
    });
  }

  async generateKeypair() {
    await this.ready;
    return this.wrapper.generateKeypair();
  }

  async sign(message, secretKey) {
    await this.ready;
    const msgBytes = typeof message === 'string' ? Buffer.from(message) : message;
    return this.wrapper.sign(msgBytes, secretKey);
  }

  async verify(message, signature, publicKey) {
    await this.ready;
    const msgBytes = typeof message === 'string' ? Buffer.from(message) : message;
    return this.wrapper.verify(msgBytes, signature, publicKey);
  }

  close() {
    cleanupDilithium();
  }
}

module.exports = { DilithiumSigner };
