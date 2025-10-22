# 06 — Data Flows

Hash-only on chain; encrypted off chain.

```
[Holder VC] --encrypt--> [Encrypted Payload Store] --hash(V C)--> [Chain Anchor]
                                    \--present--> [Verifier] --/verifyCredential?hash=...--> [Verify API]
```
