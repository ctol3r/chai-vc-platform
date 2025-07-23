# Post-Quantum Upgrade Path and Escrow VC Design

This white-paper describes a strategy for evolving verifiable credential (VC) infrastructure to resist quantum attacks while supporting escrow workflows.

## Motivation

The current cryptographic foundations of many credential systems rely on algorithms that are vulnerable to quantum computers. In parallel, healthcare credentialing requires an escrow mechanism so that organizations can validate credentials before they are fully released to the subject. We need an upgrade path that incorporates post-quantum (PQ) algorithms without disrupting existing deployments.

## Upgrade Path

1. **Hybrid Signatures**: Begin issuing credentials that include both classical and PQ signature suites (e.g., Ed25519 alongside Dilithium).  Holders and verifiers can continue using the classical algorithms while gradually adopting PQ verification support.
2. **Transport Agility**: Ensure that credential transport protocols are agnostic to the signature suite so that PQ algorithms can be rolled out without changing message formats.
3. **Revocation Reissuance**: Allow already-issued credentials to be re-signed with PQ algorithms when holders request renewal or when revocation events occur.
4. **Monitoring and Alerting**: Track the adoption of PQ-capable clients.  Once a threshold is reached, deprecate classical-only credentials and enforce PQ signatures for all newly issued VCs.

## Escrow Credential Design

Escrowed credentials allow issuers to create a VC whose attributes remain hidden until certain conditions are met. The design revolves around three phases:

1. **Issuance**: The issuer signs a credential containing encrypted attributes. The decryption key is split using a threshold secret sharing scheme between the escrow service and the subject.
2. **Verification**: Relying parties verify the signature and interact with the escrow service to confirm that release conditions have been satisfied (e.g., employment verification or identity checks).
3. **Release**: When conditions are fulfilled, the escrow service provides its share of the decryption key so the subject can reveal the attributes to the verifier.

## Future Work

- Evaluate PQ-friendly secret sharing schemes to minimize the risk of quantum attacks on escrowed keys.
- Prototype interoperability between classical and PQ verification pipelines in the existing platform.
- Conduct security audits focusing on the transition period where hybrid signatures are used.

