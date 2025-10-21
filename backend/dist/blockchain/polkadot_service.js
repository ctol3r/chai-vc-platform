"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PolkadotService = void 0;
function mockTxHash(hash) {
    const trimmed = hash?.replace(/^0x/i, '') ?? '';
    const slice = trimmed.slice(0, 16).padEnd(16, '0');
    return `0x${slice.toLowerCase()}`;
}
class PolkadotService {
    async issueCredential(hash, _signer) {
        return {
            txHash: mockTxHash(hash),
            status: 'mock-finalized',
        };
    }
    async revokeCredential(hash, _reason) {
        return {
            txHash: mockTxHash(hash),
            status: 'mock-finalized',
        };
    }
    async authorizeIssuer(_account) {
        // no-op mock
    }
    async deauthorizeIssuer(_account) {
        // no-op mock
    }
    async connect(_endpoint) {
        // no-op mock
    }
    async storeAuditRecord(_record) {
        // no-op mock
    }
    async recordErasure(_record) {
        // no-op mock
    }
    scheduleKeyRotation(_newKey, _transitionTime) {
        // no-op mock
    }
    getSigningKey(_currentTime = Date.now()) {
        return 'mock-signing-key';
    }
    async tryAnchor(hash) {
        try {
            await this.issueCredential(hash);
        }
        catch (e) {
            console.warn('anchor_failed', { e });
        }
    }
}
exports.PolkadotService = PolkadotService;
