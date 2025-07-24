import assert from 'assert';
import { issueCredential, validateCredential } from '../src/index.js';

const payload = { id: 1, name: 'Alice' };
const secret = 'topsecret';

const credential = issueCredential(payload, secret);
assert.ok(validateCredential(credential, secret));
credential.signature = 'bad';
assert.ok(!validateCredential(credential, secret));

console.log('All JS SDK tests passed');
