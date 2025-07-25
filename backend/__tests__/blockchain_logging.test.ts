import { BlockchainIntegration } from '../src/blockchain/blockchain_integration';

(async () => {
  const blockchain = new BlockchainIntegration();
  await blockchain.logDecision('approve credential', { id: 1 });
  await blockchain.logDecision('reject credential', { id: 2 });
  const logs = (blockchain as any).service.getLogs();
  if (logs.length !== 2) {
    throw new Error('Incorrect number of log entries');
  }
  console.log('blockchain logging test passed');
})();
