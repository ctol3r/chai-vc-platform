import assert from 'assert';
import { SoulboundToken } from '../src/blockchain/soulbound_token';

const attributes = {
  name: 'Alice',
  age: '30',
  country: 'Wonderland',
};

const token = new SoulboundToken(attributes);
const disclosure = token.generateDisclosure('age');

// Should verify correctly for the disclosed attribute
assert(
  SoulboundToken.verifyDisclosure(token.root, 'age', disclosure.value, disclosure.proof),
  'Valid disclosure should verify',
);

// Verification should fail for incorrect value
assert(
  !SoulboundToken.verifyDisclosure(token.root, 'age', '31', disclosure.proof),
  'Incorrect attribute value should not verify',
);

console.log('Selective disclosure test passed');
