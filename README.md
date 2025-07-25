# Chai VC Platform

End-to-end healthcare credentialing and hiring verification.

This demo now includes immutable audit scrapbooks recorded on-chain for every
major identity action. The `AuditScrapbook` class writes an audit record through
the `PolkadotService` which would normally commit a transaction containing a hash
of the activity.
