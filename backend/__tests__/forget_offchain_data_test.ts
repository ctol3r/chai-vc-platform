const assert = require('assert');
const { storeCredential, forgetOffchainData } = require('../src/controllers/credential_controller');

const record = { id: 'cred1', hashedVC: 'abc123', personalData: 'PII' };
storeCredential(record);

const result = forgetOffchainData('cred1');
assert.deepStrictEqual(result, { id: 'cred1', hashedVC: 'abc123' });
console.log('Right-to-be-forgotten test passed');
