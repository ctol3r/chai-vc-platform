import express from 'express';
import client from 'prom-client';

const app = express();
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics();

// Histogram to track request duration
export const httpRequestDurationSeconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  buckets: [0.1, 0.3, 0.5, 1, 1.5, 2, 5]
});

// Gauge for blockchain block time
export const blockTimeSeconds = new client.Gauge({
  name: 'block_time_seconds',
  help: 'Latest blockchain block time in seconds'
});

app.use((req, res, next) => {
  const end = httpRequestDurationSeconds.startTimer();
  res.on('finish', () => end());
  next();
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

// Example endpoint that updates blockTimeSeconds
app.get('/update-block', (_req, res) => {
  const blockTime = Math.random() * 10; // placeholder value
  blockTimeSeconds.set(blockTime);
  res.json({ blockTime });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
