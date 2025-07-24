const assert = require('assert');
const { generateEmploymentOffer } = require('../src/employment/offer_generator');
const { EscrowService } = require('../src/employment/escrow_service');

const offer = generateEmploymentOffer({
  employeeName: 'Alice',
  employerName: 'Acme Corp',
  role: 'Engineer',
  salary: '$100k',
  depositEther: 1
});

assert.strictEqual(offer.employeeName, 'Alice');
assert.ok(offer.agreement.includes('Acme Corp'));

const escrow = new EscrowService();
escrow.createEscrow('offer1', 1);
assert.strictEqual(escrow.getEscrow('offer1').amount, 1);
escrow.releaseEscrow('offer1');
assert.ok(escrow.getEscrow('offer1').released);

console.log('Employment offer tests passed');
