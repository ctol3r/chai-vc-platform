# Chai VC Platform

End-to-end healthcare credentialing and hiring verification.

## ZK Circuits

Circuits under `zk-circuits/` provide zero-knowledge proofs of credential
attributes without revealing the entire credential. The `credentialAttributeEquality.circom`
circuit proves that a specific attribute equals an expected value while
ensuring the Poseidon commitment of all attributes remains intact.

To compile:

```bash
circom zk-circuits/credentialAttributeEquality.circom --r1cs --wasm -o build
```

This will create the R1CS and WASM files in the `build/` directory.
