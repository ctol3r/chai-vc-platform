const assert = require('assert');
const { DIDRegistry } = require('../../dist/src/blockchain/did_rotation.js');

const registry = new DIDRegistry();
const did = { id: 'did:example:123', publicKey: 'oldKey', revokedKeys: [] };
registry.register(did);
const updated = registry.rotateKeys('did:example:123', 'newKey');
assert.strictEqual(updated.publicKey, 'newKey');
assert.deepStrictEqual(updated.revokedKeys, ['oldKey']);
console.log('did_rotation test passed');
