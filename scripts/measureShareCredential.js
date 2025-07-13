const { performance } = require('perf_hooks');

async function shareCredential() {
  // Placeholder for the share credential workflow
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 1000));
}

async function run() {
  const start = performance.now();
  await shareCredential();
  const end = performance.now();
  const elapsed = (end - start) / 1000; // seconds
  console.log(`Share credential workflow time: ${elapsed.toFixed(2)}s`);
  if (elapsed > 30) {
    throw new Error('Share credential workflow exceeded 30s limit');
  }
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
