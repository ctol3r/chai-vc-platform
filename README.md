# Chai VC Platform

End-to-end healthcare credentialing and hiring verification.

## Compliance Reports

Weekly compliance reports are generated automatically using GitHub Actions. The workflow runs the `scripts/generate_compliance_report.py` script every Sunday and uploads the resulting report as an artifact. To enable AI summarization, provide an `OPENAI_API_KEY` secret in the repository settings.
