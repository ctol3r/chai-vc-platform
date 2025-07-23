# Soul-Bound NFT Pallet for CME Credits

This document outlines a potential design for implementing non-transferable CME credit tokens using the Substrate framework. The goal is to issue credits as "soul-bound" NFTs – tokens that are permanently bound to a healthcare professional's account once minted.

## Overview

- **Non-transferable**: Tokens cannot be transferred between accounts after minting. They may only be minted or burned by authorized origins.
- **Metadata**: Each token stores relevant CME data (e.g., provider, course ID, credit hours, issue date).
- **Revocation**: Credits may be revoked by a trusted origin, which burns the token.
- **Queryability**: It should be possible to query a professional's wallet to retrieve a complete record of earned CME credits.

## Pallet Structure

- `Config` trait defines:
  - `Event` type for emitting pallet events.
  - `CmeCreditId`: token identifier type.
  - `IssuerOrigin`: origin allowed to mint or burn tokens (e.g., root or a privileged role).
- Storage:
  - `NextCreditId`: Auto-incrementing ID for new credits.
  - `Credits`: Mapping from `CmeCreditId` to `CreditDetails` struct.
  - `OwnerToCredits`: Mapping from account ID to the set of owned credit IDs.
- Types:
  - `CreditDetails { owner: AccountId, metadata: BoundedVec<u8>, issued_at: BlockNumber }`
- Public functions (extrinsics):
  - `issue_credit(owner: AccountId, metadata: Vec<u8>)`: Mints a new credit bound to `owner`.
  - `revoke_credit(credit_id: CmeCreditId)`: Burns an existing credit.
- Hooks and helpers to restrict transfers. Standard NFT transfer functions are omitted to enforce soul-bound behavior.

## Usage Flow

1. CME provider calls `issue_credit` with the professional's account ID and course metadata.
2. Pallet stores the credit and emits an `Issued` event.
3. Professionals can query their wallet to list all credit IDs and metadata.
4. If a credit is invalidated, `revoke_credit` is called by the issuer origin, burning the token and emitting a `Revoked` event.

## Notes

- Metadata format is flexible: it could hold a CID pointing to off-chain data or a serialized struct with CME details.
- Access control for the issuer origin should integrate with the broader governance model (e.g., using `EnsureOrigin` or membership pallet).
- A simple UI could display all credits for a wallet and the cumulative credit hours earned.

