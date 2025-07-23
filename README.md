# Chai VC Platform

End-to-end healthcare credentialing and hiring verification.

## Anomaly Detection Agent

The `anomaly_detection` package provides a simple command-line tool that sends
transaction logs to GPT-4 for analysis. Ensure the `OPENAI_API_KEY`
environment variable is set, then run:

```bash
python anomaly_detection/transaction_anomaly_agent.py /path/to/transactions.log
```

The output will contain any anomalies flagged by GPT-4.
