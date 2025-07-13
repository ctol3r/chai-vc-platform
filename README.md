# Chai VC Platform

End-to-end healthcare credentialing and hiring verification.

## Risk Scoring Engine

The backend includes a basic risk-scoring engine under `backend/src/risk`. It
aggregates individual risk checks and computes a composite score. Example usage:

```bash
# compile TypeScript
npx tsc

# run the demo
node backend/src/risk/index.js
```

The demo prints a composite score with details from each configured check.
