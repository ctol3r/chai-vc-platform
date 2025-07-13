# Chai VC Platform

End-to-end healthcare credentialing and hiring verification.

## Revocation Notifications

When a credential is revoked, clinicians and subscribed verifiers can be notified using the `revokeCredential` controller which relies on `notifyOnRevocation`. The notifier currently logs a message for each recipient as a placeholder for real notification infrastructure.
