# Chai VC Platform

End-to-end healthcare credentialing and hiring verification.

## Micropayment Channels

This repository includes a lightweight implementation of a micropayment channel
used for off-chain API calls with on-chain settlement. The implementation lives
in `backend/src/payments/micropayment_channel.ts` and provides utilities to
create vouchers that can later be settled on-chain.

