generated-by: Claude 2025-09-26T00:00:00Z
# ZKP Circuit Specification Template

## Title
e.g., State License Proof

## Purpose
Describe what the circuit proves (e.g., license is valid in multiple states).

## Inputs
- Public inputs:
  - e.g., state_id, license_hash
- Private witness values:
  - e.g., credential JSON fields

## Constraints
- Describe mathematical constraints and checks

## Complexity Estimate
- R1CS constraints: ~XXk
- Prover time: ~XX ms
- Verifier time: ~XX ms

## Test Vectors
```json
{
  "input": { "state": "CA", "license": "RN-12345" },
  "expected": true
}
```