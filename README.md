# Chai VC Platform

End-to-end healthcare credentialing and hiring verification.

## Background Job

The `backend/src/jobs/credential_status_job.ts` file contains a simple background
job that connects to a Polkadot node and updates credential status on-chain.
This job uses the `PolkadotService` to submit a `credentials.setStatus`
extrinsic for each credential record.
