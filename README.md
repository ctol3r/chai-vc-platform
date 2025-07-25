# Chai VC Platform

End-to-end healthcare credentialing and hiring verification.

## Governance

The platform now includes a simple DAO governance module located in
`backend/src/blockchain/governance.ts`. This allows community members to
propose changes to key economic parameters (such as `interestRate` and
`inflationRate`) and vote on them. Proposals that receive more `votesFor`
than `votesAgainst` will update the current economic configuration when
finalized.
