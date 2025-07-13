# Chai VC Platform

End-to-end healthcare credentialing and hiring verification.

## Signature transition flag

Set the environment variable `ACCEPT_PQ_SIGS=true` to allow the backend to accept
both traditional ECDSA signatures and post-quantum (PQ) signatures during the
migration period. When unset or set to any other value, only ECDSA signatures
are accepted.
