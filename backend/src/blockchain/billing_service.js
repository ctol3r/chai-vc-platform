const { PolkadotService } = require('./polkadot_service');
const { getPlan } = require('../subscription/subscription_plans');

class BillingService {
  constructor() {
    this.polkadot = new PolkadotService();
  }

  async chargeCompany(companyId, planId, recipient) {
    const plan = getPlan(planId);
    const tx = await this.polkadot.executePayment(plan.price, recipient);
    return { companyId, planId, tx };
  }
}

module.exports = { BillingService };
