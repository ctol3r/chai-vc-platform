import client from 'prom-client';

export const registry = new client.Registry();
client.collectDefaultMetrics({ register: registry });

export const verifyAttempts = new client.Counter({
  name: 'proof_verification_attempts_total',
  help: 'Total proof verification attempts',
});

export const verifySuccess = new client.Counter({
  name: 'proof_verification_success_total',
  help: 'Total successful proof verifications',
});

export const verifyDuration = new client.Histogram({
  name: 'proof_verification_duration_seconds',
  help: 'Duration of proof verification',
  buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2, 5],
});

registry.registerMetric(verifyAttempts);
registry.registerMetric(verifySuccess);
registry.registerMetric(verifyDuration);

export default registry;
