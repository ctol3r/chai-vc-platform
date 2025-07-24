const PLANS = [
  { id: 'basic', name: 'Basic', price: 50, intervalInMonths: 1, features: ['10 hires'] },
  { id: 'pro', name: 'Pro', price: 200, intervalInMonths: 1, features: ['unlimited hires', 'priority support'] },
  { id: 'enterprise', name: 'Enterprise', price: 500, intervalInMonths: 1, features: ['dedicated support', 'on-chain reporting'] }
];

function getPlan(id) {
  const plan = PLANS.find(p => p.id === id);
  if (!plan) throw new Error(`Plan ${id} not found`);
  return plan;
}

function listPlans() {
  return PLANS;
}

module.exports = { getPlan, listPlans, PLANS };
