# Chai VC Platform

End-to-end healthcare credentialing and hiring verification.

## Zero-Knowledge Proof Prototype

The `zkp/prototype_license_zkp.py` script demonstrates a simple private query
zero-knowledge proof. It uses the Schnorr identification protocol so a prover
can convince a verifier that they hold a valid license secret without revealing
any license details. Run it with:

```bash
python3 zkp/prototype_license_zkp.py
```

The script is purely illustrative and **not** production ready.
