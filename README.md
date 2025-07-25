# Chai VC Platform

End-to-end healthcare credentialing and hiring verification.

## Smart Contracts

The repository now includes Solidity contracts that implement basic escrow
functionality:

- `JobOfferEscrow.sol` handles deposits from employers for job offers. Funds are
  released to the candidate once they accept the offer, or refunded if the
  employer cancels before acceptance.
- `MilestoneEscrow.sol` supports milestone based payments. A payer deposits
  funds for a payee and can release them when a milestone is completed.

Both contracts can be found in the `contracts/` directory and are provided under
the MIT license.
