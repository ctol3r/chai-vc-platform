# Credential Registry Pallet

DEPRECATED: Use `substrate/pallets/credential` as the single source of truth.

This pallet was an early registry storing credential hash → issuer DID.
The main credential pallet (under `substrate/pallets/credential`) now maintains issuer/subject DID fields, revocation reasons, and indexes for fast lookups (by issuer and subject). Please migrate any consumers to the main pallet and avoid adding new features here.

It exposes a `store_credential` extrinsic for adding new credentials, but this is slated for removal after migration.
