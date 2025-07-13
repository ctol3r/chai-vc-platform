# Chai VC Platform

End-to-end healthcare credentialing and hiring verification.

## Webhook Integration

The backend exposes utilities to push newly hired clinicians to a hospital HRIS system.
Set the environment variable `HRIS_WEBHOOK_URL` to the target webhook endpoint. When
`hireClinician` is called, clinician details are POSTed to this URL as JSON.
