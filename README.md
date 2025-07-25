# Chai VC Platform

End-to-end healthcare credentialing and hiring verification.

## Explainability Logs

The backend includes utilities to hash GPT rationale and anchor it on-chain using `PolkadotService`.  Call `verifyCredential` with an identifier and a textual rationale to store a hash of the explanation on the blockchain.
