# Chai VC Platform

End-to-end healthcare credentialing and hiring verification.

## Trust Registry Smart Contract

The `backend/src/blockchain/TrustRegistry.sol` contract implements a simple on-chain registry for credential issuers. Each issuer can be registered and receive weighted endorsement votes from other accounts. Endorsements accumulate as reputation for the issuer while preventing duplicate votes from the same endorser.

