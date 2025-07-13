# Chai VC Platform

End-to-end healthcare credentialing and hiring verification.

## Attribute Proof Circuits

The backend includes a small zk-SNARK setup using [circom](https://docs.circom.io/) and [snarkjs](https://github.com/iden3/snarkjs). Circuits live in `backend/zkp/circuits` and can be compiled with circom. Proofs can be verified using snarkjs and the `backend/src/zkp/verify.cjs` helper script.

Example compilation steps:

```bash
cd backend/zkp/circuits
circom attributeEquality.circom --r1cs --wasm --sym
snarkjs groth16 setup attributeEquality.r1cs pot16_final.ptau attributeEquality_0000.zkey
snarkjs zkey export verificationkey attributeEquality_0000.zkey vkey.json
```

To verify a proof:

```bash
node ../src/zkp/verify.cjs vkey.json proof.json public.json
```
