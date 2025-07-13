# Chai VC Platform

End-to-end healthcare credentialing and hiring verification.

## Issuer MFA

Issuer accounts now require multi-factor authentication using TOTP. When a new
issuer registers, the backend generates a secret and QR code that can be
scanned with any authenticator app. Subsequent logins must supply a valid TOTP
token in addition to the usual credentials.
