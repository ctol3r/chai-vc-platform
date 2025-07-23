# Chai VC Platform

End-to-end healthcare credentialing and hiring verification.

## Selective Disclosure ZKP

The `backend/src/zkp` folder contains a Circom circuit and helper script for generating proofs that only disclose chosen attributes from a larger credential. The circuit hashes all attributes using Poseidon and enforces that any revealed fields match what is committed in the proof, enabling granular sharing.

Run `npm install` inside `backend` to install the dependencies. After compiling the circuit with `snarkjs` to produce the `.wasm`, `.zkey` and verification key files, place them next to the script along with an `inputs.json` file. Proof generation can then be executed with `npm run zkp:generate`.
