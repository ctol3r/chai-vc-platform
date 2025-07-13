# Selective Disclosure Verifier Contract

This folder contains a simple zk-SNARK verifier contract for selective disclosures.
The verifier uses a placeholder verifying key. Replace the key with one generated
from your own circuit before deploying to production.

## Files

- `contracts/SelectiveDisclosureVerifier.sol` – Solidity verifier contract.
- `scripts/deploy.js` – Hardhat script that compiles and deploys the contract.
- `hardhat.config.js` – Hardhat configuration.
- `package.json` – project dependencies.

## Deployment

Install dependencies and deploy using Hardhat:

```bash
cd verifier-contract
npm install
npx hardhat run scripts/deploy.js --network <network>
```

Update `hardhat.config.js` with network settings such as RPC URLs and private keys
before running the deploy script.
