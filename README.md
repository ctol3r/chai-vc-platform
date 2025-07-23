# Chai VC Platform

End-to-end healthcare credentialing and hiring verification.

## Smart Contracts

The `contracts` directory contains Solidity contracts that demonstrate how on-chain
verification and trust management can be handled:

* `ProofVerifier.sol` &ndash; verifies credential hashes and checks revocation status.
* `TrustRegistry.sol` &ndash; simple trust registry allowing issuers to accumulate
  reputation through endorsement votes.
* `SelectiveDisclosureVerifier.sol` &ndash; skeleton for integrating zero-knowledge
  proof verification to enable selective attribute disclosure.

These contracts are minimal examples and are intended as a starting point for a
full blockchain-based credential platform.
