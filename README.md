# Chai VC Platform

End-to-end healthcare credentialing and hiring verification.

## Validator Node Security

Validator nodes should only run on machines operated by trusted healthcare entities. The backend includes a guard that verifies the current instance before starting a validator.

Set the `HEALTHCARE_ENTITY_ID` environment variable on each instance to a unique identifier for the healthcare organization. Configure `TRUSTED_HEALTHCARE_ENTITIES` with a comma-separated list of allowed identifiers. Nodes will refuse to start if the current entity ID is not in this list.
