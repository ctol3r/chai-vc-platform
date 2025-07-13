# Chai VC Platform

End-to-end healthcare credentialing and hiring verification.

## Revocation Endpoint

Issuer systems can revoke a credential by sending a `POST` request to
`/api/credentials/:id/revoke`. The endpoint responds with a JSON body
containing the credential identifier and revocation status.

Frontend pages include a "Revoke Credential" button that triggers this
request and displays a confirmation once successful.
