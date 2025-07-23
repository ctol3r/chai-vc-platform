# Chai VC Platform

End-to-end healthcare credentialing and hiring verification.

## BBS+ Wallet Demo

A minimal wallet demo using [BBS+ signatures](https://github.com/mattrglobal/bbs-signatures) is available under `wallet/`. The demo shows how to create a key pair, sign a credential and derive a field-level proof.

Run the demo with:

```bash
node wallet/demo.js
```

The script will output the base64 encoded signature and a proof revealing only the first field of the credential.
