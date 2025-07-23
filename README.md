# Chai VC Platform

End-to-end healthcare credentialing and hiring verification.

## Policy Audit Agent

A basic self-auditing agent monitors files in the `policies/` directory for any
changes. It runs continuously and records SHA256 hashes in
`policy_audit/policy_hashes.json`. If a policy file hash differs from the
previous run, the agent prints a warning.

Run the agent once with:

```bash
python policy_audit/agent.py
```

The script stores baseline hashes automatically and re-checks every minute.
