# Chai VC Platform

End-to-end healthcare credentialing and hiring verification.

## State Board Simulation

A simple script demonstrates how a state board CSV update could automatically
issue Verifiable Credentials (VCs). The script parses a CSV file and writes
credential files to an output folder.

Run the simulation from the project root using `ts-node` or after compiling
TypeScript to JavaScript:

```
node backend/src/simulations/state_board_simulation.ts
```
