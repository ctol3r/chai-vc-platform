# Chai VC Platform

End-to-end healthcare credentialing and hiring verification.

## Infrastructure

Terraform definitions live under the `infrastructure` directory. The cost
optimizer Lambda there is scheduled monthly and provides a starting point for
automatically right-sizing EKS node groups.
