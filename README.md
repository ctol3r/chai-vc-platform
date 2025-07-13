# Chai VC Platform

End-to-end healthcare credentialing and hiring verification.

## AWS KMS Signer Adapter

A simple adapter is provided under `backend/src/blockchain/aws_kms_adapter.ts` for signing payloads using AWS KMS. It relies on the AWS SDK v3 and expects a `region` and `keyId` during construction.
