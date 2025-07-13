# Chai VC Platform

End-to-end healthcare credentialing and hiring verification.

## OCR-based Credential Import

The backend includes a helper for importing credential data from uploaded documents. It posts files to an external OCR service defined by `OCR_SERVICE_ENDPOINT` and uses the `OCR_SERVICE_API_KEY` for authentication. The service returns extracted credential data which can then be persisted.
