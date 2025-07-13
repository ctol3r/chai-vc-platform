# Chai VC Platform

End-to-end healthcare credentialing and hiring verification.

## Test Data Generation

A placeholder CLI script is provided in `scripts/bulk_issue.ts` for generating sample credential data. It outputs an array of JSON objects. Run it with `ts-node` and provide an optional count:

```bash
npx ts-node scripts/bulk_issue.ts 5
```

This will print five demo credential records to `stdout`.
