# Chai VC Platform

End-to-end healthcare credentialing and hiring verification.

## Marketplace Governance

The platform includes a simple on-chain inspired governance council (DAO) for
adjusting marketplace fees and rules. The DAO logic lives in
`backend/src/blockchain/governance_dao.ts` and provides in-memory membership,
proposal creation, voting and execution. It can be extended with real smart
contracts in future iterations.
