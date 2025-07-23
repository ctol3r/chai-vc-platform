# Chai VC Platform

End-to-end healthcare credentialing and hiring verification.

## OPA Gatekeeper

Terraform plans are validated in CI using OPA via the `conftest` GitHub action. Policies live in the `policy/` directory. The sample `iam_least_privilege.rego` policy fails if any `aws_iam_policy` contains wildcard privileges. The `.github/workflows/terraform-opa.yml` workflow runs `terraform plan`, converts the plan to JSON, and tests it against these policies.
