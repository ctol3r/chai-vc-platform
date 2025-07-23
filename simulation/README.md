# Simulation Environment

This directory contains a lightweight simulator that allows AI agents to run "what-if" credentialing scenarios offline.

## Running a scenario

Execute the simulator with a scenario file:

```bash
python credential_scenario_simulator.py scenarios/example.json
```

The simulator will process the actions defined in the scenario and print the result of each step.

## Scenario format

A scenario file is JSON containing a list of `credentials` and `actions`. Actions can include:

- `verify` – check the current status of a credential.
- `revoke` – mark a credential as revoked.

See `scenarios/example.json` for a reference structure.
