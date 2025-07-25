# Chai VC Platform

End-to-end healthcare credentialing and hiring verification.

## Deflationary Token Mechanism

A simple token implementation is provided in `backend/src/blockchain/deflationary_token.ts`.
Each transfer burns a portion of the tokens, reducing the total supply over time.
This burn also occurs when tokens are consumed for utility actions via `useUtility`.
