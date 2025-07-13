# Chai VC Platform

End-to-end healthcare credentialing and hiring verification.

## Onboarding UI

This repo includes a simple multi-step onboarding flow located at
`frontend/pages/onboarding.tsx`.

1. **NPI Entry** – users provide their NPI.
2. **Confirm/Edit** – review or edit basic details.
3. **OTP** – enter a one-time passcode for verification.
4. **Success** – completion screen.

The flow is purposefully lightweight and demonstrates how the platform
could collect provider details before issuing credentials.
