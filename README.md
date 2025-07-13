# Chai VC Platform

End-to-end healthcare credentialing and hiring verification.

## Blockchain Monitoring

The backend includes a simple monitoring utility for checking node health and detecting forks on a Substrate-based network.

### Usage

1. Install dependencies (requires Node.js):
   ```bash
   cd backend && npm install
   ```
2. Start the monitor (update the WebSocket endpoint as needed):
   ```bash
   npm run monitor
   ```

The monitor connects to the node via WebSocket, periodically checks the finalized head, and prints a message if a fork is detected.
