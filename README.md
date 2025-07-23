# Chai VC Platform

End-to-end healthcare credentialing and hiring verification.

## GDPR Data Portability Export

A helper script is included to export a user's Verifiable Credentials in a
zip file. Credentials are expected to be stored as JSON-LD files under
`data/vcs/<user_id>/`.

Run the exporter with Python:

```bash
python backend/src/data_portability/export_vcs.py <user_id>
```

The archive will be written to the `exports/` directory as
`<user_id>_vcs.zip`.
