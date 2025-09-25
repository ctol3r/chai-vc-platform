"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PolkadotService = void 0;
const api_1 = require("@polkadot/api");
const key_rotation_policy_1 = require("./key_rotation_policy");
/**
 * Service wrapping Polkadot-js API interactions.
 */
class PolkadotService {
    constructor(initialKey) {
        this.api = null;
        this.keyPolicy = new key_rotation_policy_1.KeyRotationPolicy(initialKey || 'default-key');
    }
    /** Connect to a chain endpoint using WebSockets. */
    async connect(endpoint) {
        const provider = new api_1.WsProvider(endpoint);
        this.api = await api_1.ApiPromise.create({ provider });
    }
    /** Issue a credential to a destination account. */
    async issueCredential(signer, dest, data) {
        if (!this.api) {
            throw new Error('API not connected');
        }
        const tx = this.api.tx.credentialsModule.issueCredential(dest, data);
        return tx.signAndSend(signer);
    }
    /**
     * Batch multiple credential issuance calls into a single extrinsic using
     * the utility.batch function.
     */
    async batchIssueCredentials(signer, destinations, data) {
        if (!this.api) {
            throw new Error('API not connected');
        }
        if (destinations.length !== data.length) {
            throw new Error('Array lengths must match');
        }
        const calls = destinations.map((dest, i) => this.api.tx.credentialsModule.issueCredential(dest, data[i]));
        const batch = this.api.tx.utility.batch(calls);
        return batch.signAndSend(signer);
    }
    /** Store audit record on-chain for immutable tracking. */
    async storeAuditRecord(record) {
        // This is a placeholder for the actual interaction with the Polkadot
        // blockchain which would store a hash of the audit data.
        console.log('Storing record on-chain:', record);
    }
    /**
     * Persist an anonymized erasure record to the blockchain.
     * The implementation is a stub for demonstration purposes.
     */
    async recordErasure(record) {
        // In a real implementation, this would submit a transaction to the chain.
        console.log('Recording erasure on-chain:', record);
    }
    /**
     * Schedule rotation of the signing key used for transactions.
     */
    scheduleKeyRotation(newKey, transitionTime) {
        this.keyPolicy.scheduleRotation(newKey, transitionTime);
    }
    /**
     * Retrieve the key that should be used for signing at the given time.
     */
    getSigningKey(currentTime = Date.now()) {
        return this.keyPolicy.getActiveKey(currentTime);
    }
}
exports.PolkadotService = PolkadotService;
