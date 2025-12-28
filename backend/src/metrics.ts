import { Registry, collectDefaultMetrics, Gauge } from 'prom-client';

export const register = new Registry();
collectDefaultMetrics({ register });

export const queueDepthGauge = new Gauge({
  name: 'queue_depth',
  help: 'Current verification request queue depth'
});

register.registerMetric(queueDepthGauge);
