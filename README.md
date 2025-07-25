# Chai VC Platform

End-to-end healthcare credentialing and hiring verification.

## Key Rotation

The backend contains a simple `KeyRotationPolicy` that supports scheduling
future signing keys with a time lock. Once the specified transition time has
passed, the policy automatically activates the new key. See
`backend/src/blockchain/key_rotation_policy.ts` for implementation details.
