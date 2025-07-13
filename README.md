# Chai VC Platform

End-to-end healthcare credentialing and hiring verification.

## Clinician Onboarding

The backend includes lightweight utilities for generating and resolving
clinician DIDs during onboarding. The `onboardClinician` helper in
`backend/src/controllers/onboarding_controller.ts` creates a new DID for a
clinician using a simple `did:example` scheme. The resulting DID document can be
looked up later with `resolveClinician` which uses the placeholder resolver in
`backend/src/blockchain/did_service.ts`.
