# Chai VC Platform

End-to-end healthcare credentialing and hiring verification.

## Error Handling UI

The frontend now includes basic logic for displaying errors when API requests hit
rate limits (HTTP 429) or time out after five seconds. Errors are presented in a
styled `ErrorDisplay` component.
