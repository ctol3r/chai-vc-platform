# Chai VC Platform

End-to-end healthcare credentialing and hiring verification.

## OTP Verification Service

The backend includes a basic `OTPService` for sending one-time passwords.
It attempts to deliver the code via SMS using Twilio and falls back to
sending an email if the SMS fails.
