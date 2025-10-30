import client from "prom-client";

const collectDefault = client.collectDefaultMetrics;
collectDefault({ timeout: 5000 });

export const commandExecCounter = new client.Counter({
  name: "vitalcv_command_execute_total",
  help: "Total number of commands executed",
  labelNames: ["command", "status", "user_role"],
});

export const npiLookupCounter = new client.Counter({
  name: "vitalcv_npi_lookup_total",
  help: "Total npi lookups",
  labelNames: ["result"], // success, cache_hit, cache_miss, error
});

export const commandLatency = new client.Histogram({
  name: "vitalcv_command_latency_seconds",
  help: "Latency distribution for command executions",
  buckets: [0.01, 0.05, 0.2, 0.5, 1, 2, 5],
  labelNames: ["command", "user_role"],
});

export const metricsHandler = async (_req: any, res: any) => {
  res.setHeader("Content-Type", client.register.contentType);
  res.end(await client.register.metrics());
};
