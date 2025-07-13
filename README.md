# Chai VC Platform

End-to-end healthcare credentialing and hiring verification.

## State-Chain Gateway

A minimal gateway implementation is provided for synchronising credential data
with state board data sources. The code lives in
`backend/src/gateway/state_chain_gateway.ts` and exposes a `StateChainGateway`
class. The `sync` method currently logs fetched records but can be extended to
persist them on-chain or in a database.
