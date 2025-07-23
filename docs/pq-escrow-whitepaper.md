# Post-Quantum Upgrade Path and Escrow VC Design

This document outlines the proposed strategy to transition the Chai VC Platform to post‑quantum (PQ) safe cryptography and introduces an escrow verifiable credential (VC) flow. Both components are key steps toward future‑proofing our identity infrastructure.

## Motivation

Recent advancements in quantum computing threaten traditional public key algorithms (e.g., RSA, ECDSA). To maintain trust in health‑care credentialing, the platform requires a clear migration strategy to PQ algorithms. Additionally, escrowed verification enables conditional disclosure of credentials, which is essential for granular sharing of sensitive health‑care data.

## PQ Upgrade Path

1. **Inventory Existing Algorithms**
   - Catalog all cryptographic primitives currently used (key exchanges, signatures, and hashing) across microservices and smart contracts.
2. **Select PQ Candidates**
   - Evaluate NIST‑recommended algorithms such as CRYSTALS‑Dilithium (signatures) and Kyber (key encapsulation). Begin prototyping with hybrid modes combining PQ and classical algorithms.
3. **Phased Rollout**
   - Introduce PQ support in parallel with current algorithms. Start with optional PQ keys for new issuers and gradually migrate existing keys.
4. **Backward Compatibility**
   - Maintain classical cryptography support during transition. Use explicit metadata in VCs to signal algorithm choices so that older clients can continue verifying.
5. **Long‑Term Decommissioning**
   - After a defined adoption threshold, remove legacy algorithms, focusing solely on PQ primitives while providing migration guides and deprecation notices.

## Escrow Verifiable Credential Design

Escrowed credentials allow claim holders to store their VCs with a trusted escrow agent. Verification only occurs when predefined conditions are met, protecting user privacy.

1. **Issuance**
   - Issuers sign credentials using PQ‑ready algorithms.
   - The holder submits the VC to an escrow service, which stores an encrypted version while returning a proof‑of‑escrow receipt.
2. **Conditional Release**
   - When a verifier needs to validate the credential, the holder or verifier triggers a release request. The escrow agent checks policy requirements (e.g., user consent, payment, or regulatory compliance) before sharing the VC.
3. **Verification**
   - The verifier checks the escrow agent's proof and the underlying VC signature, ensuring authenticity and integrity.
4. **Revocation Handling**
   - The escrow agent monitors revocation registries to prevent release of revoked credentials. Holders receive notifications for any status changes.

## Conclusion

Transitioning to PQ cryptography and implementing an escrow VC workflow strengthens the resilience of the Chai VC Platform. These measures safeguard credential integrity against future quantum threats while offering fine‑grained control over credential disclosure.
