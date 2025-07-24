import { RevocationWatcher } from './revocation_watcher';

const endpointsEnv = process.env.REVOCATION_ENDPOINTS || '';
const endpoints = endpointsEnv.split(',').map(e => e.trim()).filter(e => e);

if (endpoints.length === 0) {
  console.error('No revocation endpoints configured. Set REVOCATION_ENDPOINTS env variable.');
  process.exit(1);
}

const watcher = new RevocationWatcher({ endpoints, pollingIntervalMs: 5000 });

watcher.on('revoked', id => {
  console.log(`Credential revoked: ${id}`);
  // Integration point: connect to credential service or database here.
});

watcher.start();
