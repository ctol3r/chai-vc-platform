const assert = require('assert');
const { getPlan } = require('../src/subscription/subscription_plans');
const { BillingService } = require('../src/blockchain/billing_service');

// Test retrieving a known plan
assert.strictEqual(getPlan('basic').name, 'Basic');

(async () => {
  const billing = new BillingService();
  const result = await billing.chargeCompany('company123', 'basic', 'recruiter-account');
  assert.ok(result.tx, 'transaction id should be defined');
})();
